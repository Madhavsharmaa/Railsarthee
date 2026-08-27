import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            Rail<span>Sarthi</span>
          </div>

          <p>
            Your railway companion for train search, live status, timetables
            and journey tools.
          </p>
        </div>

        <div>
          <h4>Features</h4>
          <Link href="/live-status">Live Train Status</Link>
          <Link href="/timetable">Train Timetable</Link>
          <Link href="/coach-position">Coach Position</Link>
          <Link href="/announcement">Announcements</Link>
        </div>

        <div>
          <h4>Search</h4>
          <Link href="/">Trains Between Stations</Link>
          <Link href="/live-status">Live Status</Link>
          <Link href="/timetable">Timetable</Link>
        </div>




        <div>
          <h4>RailSarthi</h4>
          <p>
            This website is created solely for educational purposes. It is 
            not intended for commercial use and is not endorsed
            by, affiliated with, or associated with IRCTC, Indian Railways, or
            any third-party service provider.
          </p>
        </div>


        
      </div>



      <div className="footer-bottom">
        Made with ❤️ for railway travellers · RailSarthi
      </div>
    </footer>
  );
}