"use client";

import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Utensils,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeSearch from "../components/HomeSearch";

const tools = [
  [
    "/live-status",
    Radio,
    "Live Train Status",
    "Check the latest running information.",
  ],
  [
    "/timetable",
    Clock3,
    "Train Timetable",
    "View station-by-station schedules.",
  ],
  [
    "/coach-position",
    TrainFront,
    "Coach Position",
    "Find where your coach will arrive.",
  ],
  [
    "/announcement",
    Utensils,
    "Announcement",
    "Generate railway-style announcements.",
  ],
] as const;

const features = [
  [
    "Fast station search",
    "Suggestions begin after three characters.",
  ],
  [
    "Train autocomplete",
    "Search by train number or name.",
  ],
  [
    "DB-powered timetable",
    "Your Neon data powers timetable features.",
  ],
  [
    "Useful journey tools",
    "Live status, coach position and more.",
  ],
] as const;

export default function Home() {
  return (
    <>
      <Header />

      <main style={{ overflowX: "hidden", width: "100%" }}>
        {/* =====================================================
            HERO SECTION
        ====================================================== */}

        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow light">
              INDIAN RAILWAY SEARCH
            </div>

            <h1>
              Your journey starts
              <br />
              <span>with the right train.</span>
            </h1>

            <p>
              Search trains, stations and railway information from
              one simple place.
            </p>

            <HomeSearch />
          </div>

          <div className="hero-track hero-track-one" />
          <div className="hero-track hero-track-two" />
        </section>

        {/* =====================================================
            TOOLS SECTION
        ====================================================== */}

        <section className="quick-section">
          <div className="section-title">
            <span>RailSarthee Tools</span>

            <h2>
              Everything you need for your journey
            </h2>
          </div>

          <div className="tool-grid">
            {tools.map(([href, Icon, title, text]) => (
              <Link
                href={href}
                className="tool-tile"
                key={href}
              >
                <span className="tile-icon">
                  <Icon size={22} />
                </span>

                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>

                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================
            PHOTO BAND
        ====================================================== */}

        <section
          className="photo-band"
          style={{
            overflow: "hidden",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="photo-copy">
            
              <div className="eyebrow" style={{ color: '#923a71' }}>
                BUILT AROUND THE JOURNEY
              </div>
         
            <h2>
              From the platform to the destination.
            </h2>

            <p>
              RailSarthee keeps railway information focused,
              quick and easy to use.
            </p>

            <Link
              href="/live-status"
              className="outline-btn"
            >
              Check Live Status
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* ONE LANDSCAPE IMAGE ONLY */}
          <div
            className="photo-placeholder"
            style={{
              width: "105%",
              height: "260px",
              overflow: "hidden",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            <img
              src="/images/new.png"
              alt="Indian railway tracks"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
        </section>

        {/* =====================================================
            FEATURES SECTION
        ====================================================== */}

        <section className="features-section">
          <div className="section-title">
            <span>
              <Sparkles size={15} />
              Special Features
            </span>

            <h2>
              Simple tools. Useful information.
            </h2>
          </div>

          <div className="feature-grid">
            {features.map(
              ([title, description], index) => (
                <div
                  className="feature-card"
                  key={title}
                >
                  <div className="feature-number">
                    0{index + 1}
                  </div>

                  <ShieldCheck size={22} />

                  <h3>{title}</h3>

                  <p>{description}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* =====================================================
            TRAVEL INSIGHTS
        ====================================================== */}

        <section className="insights">
          <div className="section-title">
            <span>Travel Insights</span>

            <h2>
              Railway information, without the clutter.
            </h2>
          </div>

          <div className="insight-grid">
            {[
              [
                "Train Routes",
                "Find trains connecting your selected stations.",
              ],
              [
                "Live Running",
                "Follow the current status of your train.",
              ],
              [
                "Station Timetable",
                "See arrival and departure details.",
              ],
              [
                "Coach Position",
                "Know where your coach belongs.",
              ],
            ].map(([title, description]) => (
              <div
                className="insight-card"
                key={title}
              >
                <MapPin size={18} />

                <h3>{title}</h3>

                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            FAQ SECTION
        ====================================================== */}

        <section className="faq">
          <div className="section-title">
            <span>
              Frequently Asked Questions
            </span>

            <h2>
              Questions travellers usually have
            </h2>
          </div>

          {[
            [
              "How do station suggestions work?",
              "Enter at least three characters and RailSarthee suggests matching stations from Neon.",
            ],
            [
              "Can I search by train name?",
              "Yes. Train suggestions can be searched by train number or name.",
            ],
            [
              "Where does timetable information come from?",
              "RailSarthee uses timetable data stored in your Neon PostgreSQL database.",
            ],
            [
              "Can I check live train status?",
              "Yes. The live status tool connects to your Flask live-status endpoint.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>

              <p>{answer}</p>
            </details>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}