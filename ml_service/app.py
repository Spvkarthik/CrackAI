import os
import uuid
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    from inference_sdk import InferenceHTTPClient
except Exception:
    InferenceHTTPClient = None
import cv2
import numpy as np


UPLOAD_FOLDER = os.environ.get("ML_UPLOAD_FOLDER", "ml_service_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ROBOFLOW_API_URL = os.environ.get("ROBOFLOW_API_URL", "https://serverless.roboflow.com")
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "")
ROBOFLOW_WORKSPACE = os.environ.get("ROBOFLOW_WORKSPACE", "qr-code-detection")
ROBOFLOW_WORKFLOW_ID = os.environ.get("ROBOFLOW_WORKFLOW_ID", "general-segmentation-api-4")
ROBOFLOW_CLASSES = os.environ.get("ROBOFLOW_CLASSES", "crack")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = None
if InferenceHTTPClient is not None:
    try:
        client = InferenceHTTPClient(api_url=ROBOFLOW_API_URL, api_key=ROBOFLOW_API_KEY)
    except Exception:
        client = None


def polygon_area(points):
    if not points or len(points) < 3:
        return 0.0
    pts = np.array([(p.get("x", 0), p.get("y", 0)) for p in points], dtype=np.float32)
    return float(cv2.contourArea(pts))


def process_image(image_path: str):
    result = client.run_workflow(
        workspace_name=ROBOFLOW_WORKSPACE,
        workflow_id=ROBOFLOW_WORKFLOW_ID,
        images={"image": image_path},
        parameters={"classes": ROBOFLOW_CLASSES},
        use_cache=True,
    )

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Image could not be read")

    try:
        predictions = result[0]["predictions"]["predictions"]
    except Exception as e:
        raise ValueError(f"Unexpected workflow output format: {e}")

    total_area = 0.0
    crack_count = 0

    # accumulate area/count and also keep predictions for annotation
    kept_predictions = []
    for pred in predictions:
        points = pred.get("points", [])
        if not points:
            continue
        total_area += polygon_area(points)
        crack_count += 1
        kept_predictions.append({"points": points})

    img_area = float(image.shape[0] * image.shape[1])
    ratio = (total_area / img_area) if img_area > 0 else 0.0

    if ratio < 0.01:
        severity = "Low"
    elif ratio < 0.05:
        severity = "Medium"
    else:
        severity = "High"

    return severity, ratio, crack_count


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/detect")
def detect():
    if "image" not in request.files:
        return jsonify({"error": "Image file is required (field name: image)"}), 400

    if not ROBOFLOW_API_KEY:
        return jsonify({"error": "ROBOFLOW_API_KEY is not set"}), 500

    file = request.files["image"]
    filename = f"{uuid.uuid4()}.jpg"
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(input_path)

    try:
        severity, ratio, count = process_image(input_path)
        # Ensure we have the image loaded for annotation
        image = cv2.imread(input_path)
        if image is None:
            raise ValueError("Image could not be read for annotation")

        # Attempt to re-run workflow to get raw predictions for annotation
        # (we already used the workflow inside process_image via client.run_workflow)
        # For simplicity, call the workflow again to retrieve detailed predictions.
        result = client.run_workflow(
            workspace_name=ROBOFLOW_WORKSPACE,
            workflow_id=ROBOFLOW_WORKFLOW_ID,
            images={"image": input_path},
            parameters={"classes": ROBOFLOW_CLASSES},
            use_cache=True,
        )

        try:
            predictions = result[0]["predictions"]["predictions"]
        except Exception:
            predictions = []

        # create an annotated copy of the input image
        annotated = image.copy()
        overlay = annotated.copy()

        for pred in predictions:
            points = pred.get("points", [])
            if not points:
                continue
            pts = np.array([(int(p.get("x", 0)), int(p.get("y", 0))) for p in points], dtype=np.int32)
            if pts.shape[0] >= 3:
                # draw filled polygon on overlay
                cv2.fillPoly(overlay, [pts], color=(0, 0, 255))
                # draw polygon border
                cv2.polylines(annotated, [pts], isClosed=True, color=(255, 255, 255), thickness=2)

        # blend overlay to give semi-transparent highlight
        alpha = 0.35
        cv2.addWeighted(overlay, alpha, annotated, 1 - alpha, 0, annotated)

        # save annotated image to uploads folder
        annotated_name = f"annotated-{filename}"
        annotated_path = os.path.join(UPLOAD_FOLDER, annotated_name)
        cv2.imwrite(annotated_path, annotated)

        # encode annotated image as base64 for transport
        with open(annotated_path, "rb") as f:
            annotated_b64 = base64.b64encode(f.read()).decode("ascii")

        return jsonify(
            {
                "severity": severity,
                "crack_ratio": float(ratio),
                "crack_count": int(count),
                "annotated_image": annotated_b64,
                "annotated_image_name": annotated_name,
            }
        )
    finally:
        # keep the service stateless for demos
        try:
            os.remove(input_path)
        except OSError:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", "5050"))
    app.run(host="0.0.0.0", port=port, debug=True)

