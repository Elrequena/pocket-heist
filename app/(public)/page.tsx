// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Quick heists. Maximum chaos.</div>

        <section className="mt-8 max-w-2xl text-center space-y-4">
          <p className="text-lg text-gray-300">
            Transform your workplace into an adventure zone. Create, assign, and
            complete hilarious office missions that bring your team together.
          </p>
          <p className="text-base text-gray-400">
            From organizing desk marathons to coordinating coffee runs, every
            heist is an opportunity for fun, teamwork, and unforgettable
            memories. Whether you're planning your next big office challenge or
            joining someone else's mission, Pocket Heist makes it easy.
          </p>
        </section>
      </div>
    </div>
  );
}
