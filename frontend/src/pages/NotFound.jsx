import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card title="Page not found" subtitle="The page you requested doesn’t exist.">
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/app/dashboard">
              <Button>Go to dashboard</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

