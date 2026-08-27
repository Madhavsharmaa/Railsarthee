import Link from "next/link";
import {Menu,TrainFront} from "lucide-react";

export default function Header(){
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand"><span className="brand-mark"><TrainFront size={22}/></span><span>Rail<span>Sarthee</span></span></Link>
    <nav>
      <Link href="/">Train Search</Link><Link href="/live-status">Live Status</Link>
      <Link href="/timetable">Timetable</Link><Link href="/coach-position">Coach Position</Link>
      <Link href="/announcement">Announcement</Link>
    </nav>
    <button className="mobile-menu" aria-label="Menu"><Menu size={20}/></button>
  </div></header>;
}
