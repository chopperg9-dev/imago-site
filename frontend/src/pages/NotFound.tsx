import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div data-testid="not-found-page" className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-heading text-7xl font-black text-terra">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">העמוד הזה עוד לא הודפס</h1>
      <p className="mt-3 text-sm text-clay-soft">נראה שהכתובת השתנתה או שהעמוד הוסר.</p>
      <Link
        to="/"
        data-testid="not-found-home-link"
        className="mt-8 rounded-full bg-terra px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
      >
        חזרה לבית
      </Link>
    </div>
  );
}
