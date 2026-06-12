"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRitualStore } from "@/store/useRitualStore";
import {
  ArrowLeft,
  Check,
  Compass,
  Shield,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { PUBLIC_TEMPLATES } from "@/lib/templates";
import {
  MISSION_CODENAMES,
  ANCHOR_NAME_SUGGESTIONS,
  KEEP_DEFINITION_SUGGESTIONS,
} from "@/utils/prompts";

const TimeSelector = ({
  label,
  time,
  setTime,
}: {
  label: string;
  time: string;
  setTime: (t: string) => void;
}) => {
  const [h, m] = time.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  const toggleAmPm = () => {
    const newHour =
      ampm === "AM"
        ? hour === 12
          ? 12
          : hour + 12
        : hour === 12
        ? 0
        : hour - 12;
    setTime(`${newHour.toString().padStart(2, "0")}:${m}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let val = parseInt(e.target.value, 10);
    if (ampm === "PM" && val !== 12) val += 12;
    if (ampm === "AM" && val === 12) val = 0;
    setTime(`${val.toString().padStart(2, "0")}:${m}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTime(`${h}:${e.target.value}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-muted p-4 flex flex-col shadow-xs gap-3">
      <span className="text-[9px] tracking-wider text-ink-secondary uppercase font-semibold">
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 relative bg-canvas border border-muted/50 rounded-xl px-2">
          <select
            value={hour12.toString()}
            onChange={handleHourChange}
            className="w-1/2 bg-transparent text-ink-primary font-semibold text-center py-2.5 outline-none appearance-none cursor-pointer text-lg z-10 pl-2"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-ink-tertiary absolute left-1/4 transform -translate-x-1/2 pointer-events-none" />
          <span className="text-ink-primary font-bold text-lg opacity-40">
            :
          </span>
          <select
            value={m}
            onChange={handleMinuteChange}
            className="w-1/2 bg-transparent text-ink-primary font-semibold text-center py-2.5 outline-none appearance-none cursor-pointer text-lg z-10 pr-2"
          >
            {["00", "15", "30", "45"].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-ink-tertiary absolute right-1/4 transform translate-x-1/2 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={toggleAmPm}
          className="bg-canvas border border-muted/50 text-ink-primary font-semibold py-2.5 px-4 rounded-xl hover:bg-muted/10 transition-colors text-sm uppercase tracking-wider w-[70px]"
        >
          {ampm}
        </button>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const addPlaylist = useRitualStore((state) => state.addPlaylist);

  // Steps:
  // 1: Set Windows
  // 2: Meet The Arc
  // 3: Q1 (Breaking Loops)
  // 4: Q2 (Body-Mind)
  // 5: Q3 (Stillness or Reset)
  // 6: Preview & Seed
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");

  // Q1 State (Small Wins)
  const [includeQ1, setIncludeQ1] = useState(true);
  const [q1Title, setQ1Title] = useState("Small Wins");

  // Q2 State (Body-Mind)
  const [includeQ2, setIncludeQ2] = useState(true);
  const [q2Title, setQ2Title] = useState("Body-Mind");

  // Q3 State (Stillness vs Reset)
  const [q3Preference, setQ3Preference] = useState<"still" | "burn" | null>(
    null
  );
  const [includeQ3, setIncludeQ3] = useState(false);
  const [q3Title, setQ3Title] = useState("Stillness");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const selectQ3Preference = (pref: "still" | "burn") => {
    setQ3Preference(pref);
    setIncludeQ3(true);
    if (pref === "still") {
      setQ3Title("Stillness");
    } else {
      setQ3Title("Reset");
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const getSessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 2500)
        ),
      ]);
      const {
        data: { session },
      } = await getSessionPromise;
      if (!session?.user) {
        router.push("/login");
        return;
      }
      const uid = session.user.id;

      const { error: stateErr } = await supabase.from("user_state").upsert(
        {
          user_id: uid,
          hardest_pillar: null,
          pause_tokens_remaining: 2,
          current_streak: 0,
          longest_streak: 0,
          lifetime_anchor_count: 0,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );

      if (stateErr) throw stateErr;

      const store = useRitualStore.getState();
      store.setOnboardingCompleted(true);
      router.push("/");
    } catch (err) {
      console.error("Skip onboarding failure:", err);
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const getSessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 2500)
        ),
      ]);
      const {
        data: { session },
      } = await getSessionPromise;
      if (!session?.user) {
        router.push("/login");
        return;
      }
      const uid = session.user.id;

      // 1. Supabase UPSERT to user_state
      const { error: stateErr } = await supabase.from("user_state").upsert(
        {
          user_id: uid,
          hardest_pillar: null,
          pause_tokens_remaining: 2,
          current_streak: 0,
          longest_streak: 0,
          lifetime_anchor_count: 0,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );

      if (stateErr) throw stateErr;

      // 2. Set wake/sleep windows in the store
      const store = useRitualStore.getState();
      store.setWakeWindow(wakeTime);
      store.setSleepWindow(sleepTime);

      // 3. Reset/Clear playlists
      useRitualStore.setState({ playlists: [] });

      // 4. Seed the user selected playlists (including codenames, keep definitions)
      if (includeQ1 && q1Title.trim()) {
        addPlaylist(q1Title.trim());
      }

      if (includeQ2 && q2Title.trim()) {
        addPlaylist(q2Title.trim());
      }

      if (includeQ3 && q3Title.trim()) {
        addPlaylist(q3Title.trim());
      }

      // Update local store state
      store.setOnboardingCompleted(true);

      // 5. Enter application
      router.push("/");
    } catch (err) {
      console.error("Discovery Flow setup failure:", err);
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-canvas bg-[#F7F6F2] relative flex flex-col justify-between p-6 sm:border-x sm:border-muted shadow-sm select-none">
      {/* 1. Header Navigation and Progress Indicators */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-8 relative">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div className="w-8" />
          )}

          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase">
            Step {step} of 6
          </span>

          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-ink-secondary hover:text-ink-primary transition-colors text-xs font-semibold uppercase tracking-wider focus:outline-none disabled:opacity-50"
          >
            Skip
          </button>
        </div>

        {/* Dots progress indicator */}
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                num === step ? "bg-accent-teal w-6" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Slide Container */}
      <div className="flex-1 flex flex-col justify-center py-6 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col gap-5"
          >
            {/* SCREEN 1: Set Windows */}
            {step === 1 && (
              <div className="flex flex-col gap-5 text-left">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
                    Establish your target windows
                  </h2>
                  <p className="text-[10px] text-ink-secondary tracking-widest uppercase mt-0.5 font-semibold">
                    Set your daily boundaries
                  </p>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                  Your daily Arc is built around these targets. We use them to
                  structure your wake window and evening wind-down window.
                </p>

                <div className="flex flex-col gap-3 mt-1">
                  <TimeSelector
                    label="Wake Window Target"
                    time={wakeTime}
                    setTime={setWakeTime}
                  />

                  <TimeSelector
                    label="Sleep Window Target"
                    time={sleepTime}
                    setTime={setSleepTime}
                  />
                </div>
              </div>
            )}

            {/* SCREEN 2: Meet The Arc */}
            {step === 2 && (
              <div className="flex flex-col gap-5 text-left">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
                    The Daily Arc
                  </h2>
                  <p className="text-[10px] text-ink-secondary tracking-widest uppercase mt-0.5 font-semibold">
                    Your daily baseline
                  </p>
                </div>

                <div className="bg-surface rounded-2xl border border-muted p-5 flex flex-col shadow-xs gap-3">
                  <div className="flex items-center gap-2 text-accent-teal">
                    <Shield className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      The Permanent Foundation
                    </span>
                  </div>
                  <p className="text-xs text-ink-primary leading-relaxed font-normal">
                    The Arc opens when you wake up and closes when you sleep. It
                    brings simple structure to your day.
                  </p>
                  <p className="text-[10px] text-ink-secondary leading-relaxed border-t border-muted/50 pt-2">
                    This playlist is permanent. It ensures you check in with
                    yourself twice every day.
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 3: Q1 (Small Wins) */}
            {step === 3 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <span className="text-[9px] font-bold text-accent-teal uppercase tracking-widest">
                    Question 01
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-ink-primary mt-0.5">
                    Success is built on small, uncomfortable actions. What is
                    one small win you can commit to?
                  </h2>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-surface border-muted shadow-xs">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold text-ink-primary">
                      Playlist: Small Wins
                    </span>
                  </div>
                  <button
                    onClick={() => setIncludeQ1(!includeQ1)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      includeQ1
                        ? "bg-accent-teal border-accent-teal text-white"
                        : "border-muted bg-canvas"
                    }`}
                  >
                    {includeQ1 && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {includeQ1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface rounded-xl border border-muted p-4 flex flex-col gap-3 shadow-xs"
                  >
                    <div>
                      <label className="text-[9px] font-bold tracking-widest text-ink-tertiary uppercase block mb-1">
                        Playlist Name
                      </label>
                      <input
                        type="text"
                        value={q1Title}
                        onChange={(e) => setQ1Title(e.target.value)}
                        className="w-full bg-canvas border border-muted text-ink-primary text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-accent-teal"
                      />
                    </div>
                  </motion.div>
                )}

                <p className="text-[10px] text-ink-secondary italic text-center">
                  Recommended: Start with only 1 custom playlist to build
                  momentum.
                </p>
              </div>
            )}

            {/* SCREEN 4: Q2 (Body-Mind) */}
            {step === 4 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <span className="text-[9px] font-bold text-accent-teal uppercase tracking-widest">
                    Question 02
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-ink-primary mt-0.5">
                    Do you want to track your physical or mental health? (e.g.
                    Body & Mind)
                  </h2>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-surface border-muted shadow-xs">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold text-ink-primary">
                      Playlist: Body-Mind
                    </span>
                  </div>
                  <button
                    onClick={() => setIncludeQ2(!includeQ2)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      includeQ2
                        ? "bg-accent-teal border-accent-teal text-white"
                        : "border-muted bg-canvas"
                    }`}
                  >
                    {includeQ2 && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {includeQ2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface rounded-xl border border-muted p-4 flex flex-col gap-3 shadow-xs"
                  >
                    <div>
                      <label className="text-[9px] font-bold tracking-widest text-ink-tertiary uppercase block mb-1">
                        Playlist Name
                      </label>
                      <input
                        type="text"
                        value={q2Title}
                        onChange={(e) => setQ2Title(e.target.value)}
                        className="w-full bg-canvas border border-muted text-ink-primary text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-accent-teal"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* SCREEN 5: Q3 (Stillness vs Reset) */}
            {step === 5 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <span className="text-[9px] font-bold text-accent-teal uppercase tracking-widest">
                    Question 03
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-ink-primary mt-0.5">
                    When your head gets loud or restless, what helps — going
                    still, or burning it off?
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => selectQ3Preference("still")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                      q3Preference === "still"
                        ? "bg-accent-teal/5 border-accent-teal text-ink-primary"
                        : "bg-surface border-muted text-ink-secondary hover:border-ink-secondary/30"
                    }`}
                  >
                    <Compass className="w-5 h-5 text-accent-teal" />
                    <span className="text-xs font-semibold">Going Still</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectQ3Preference("burn")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                      q3Preference === "burn"
                        ? "bg-accent-teal/5 border-accent-teal text-ink-primary"
                        : "bg-surface border-muted text-ink-secondary hover:border-ink-secondary/30"
                    }`}
                  >
                    <Shield className="w-5 h-5 text-accent-teal" />
                    <span className="text-xs font-semibold">
                      Burning it off
                    </span>
                  </button>
                </div>

                {q3Preference && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-surface rounded-xl border border-muted p-4 flex flex-col gap-3 shadow-xs mt-2"
                  >
                    <div className="flex items-center justify-between border-b border-muted/50 pb-2">
                      <span className="text-xs font-semibold text-ink-primary">
                        Recommended:{" "}
                        {q3Preference === "still"
                          ? "Stillness"
                          : "Reset / The Forge"}
                      </span>
                      <button
                        onClick={() => setIncludeQ3(!includeQ3)}
                        className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                          includeQ3
                            ? "bg-accent-teal text-surface border-accent-teal"
                            : "bg-canvas text-ink-secondary border-muted"
                        }`}
                      >
                        {includeQ3 ? "Selected" : "Add Playlist"}
                      </button>
                    </div>

                    {includeQ3 && (
                      <div className="flex flex-col gap-3 pt-1">
                        <div>
                          <label className="text-[9px] font-bold tracking-widest text-ink-tertiary uppercase block mb-1">
                            Playlist Name
                          </label>
                          <input
                            type="text"
                            value={q3Title}
                            onChange={(e) => setQ3Title(e.target.value)}
                            className="w-full bg-canvas border border-muted text-ink-primary text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-accent-teal"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* SCREEN 6: Review & Seed */}
            {step === 6 && (
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink-primary">
                    Your Daily Trellis
                  </h2>
                  <p className="text-[10px] text-ink-secondary tracking-widest uppercase mt-0.5 font-semibold">
                    Review your initial structure
                  </p>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                  Here is the layout of daily playlists we are building for you.
                  These are your foundations.
                </p>

                <div className="flex flex-col gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                  {/* The Arc */}
                  <div className="p-3 bg-surface rounded-xl border border-muted flex items-start gap-3 shadow-xs">
                    <div className="w-7 h-7 rounded-lg bg-accent-teal/5 text-accent-teal flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-ink-primary">
                          The Arc
                        </h4>
                        <span className="text-[8px] bg-accent-teal/10 text-accent-teal px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Baseline
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-secondary mt-0.5">
                        Opens on waking ({wakeTime}), closes with wind-down (
                        {sleepTime}).
                      </p>
                    </div>
                  </div>

                  {/* Q1 */}
                  {includeQ1 && (
                    <div className="p-3 bg-surface rounded-xl border border-muted flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-canvas text-ink-secondary flex items-center justify-center shrink-0 text-xs font-semibold">
                        01
                      </div>
                      <div className="flex items-center h-7">
                        <h4 className="text-xs font-semibold text-ink-primary">
                          {q1Title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {/* Q2 */}
                  {includeQ2 && (
                    <div className="p-3 bg-surface rounded-xl border border-muted flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-canvas text-ink-secondary flex items-center justify-center shrink-0 text-xs font-semibold">
                        02
                      </div>
                      <div className="flex items-center h-7">
                        <h4 className="text-xs font-semibold text-ink-primary">
                          {q2Title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {/* Q3 */}
                  {includeQ3 && (
                    <div className="p-3 bg-surface rounded-xl border border-muted flex items-start gap-3 shadow-xs">
                      <div className="w-7 h-7 rounded-lg bg-canvas text-ink-secondary flex items-center justify-center shrink-0 text-xs font-semibold">
                        03
                      </div>
                      <div className="flex items-center h-7">
                        <h4 className="text-xs font-semibold text-ink-primary">
                          {q3Title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {!includeQ1 && !includeQ2 && !includeQ3 && (
                    <div className="text-center py-4 bg-canvas border border-dashed border-muted rounded-xl">
                      <p className="text-xs text-ink-secondary">
                        Just The Arc active. Perfectly calm baseline setup.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Footer Action Button */}
      <div className="mt-4">
        {step < 6 ? (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs bg-accent-teal text-surface hover:bg-accent-teal/95"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest bg-accent-teal text-surface hover:bg-accent-teal/95 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs ${
              isSubmitting ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {isSubmitting ? "Building Structure..." : "Enter Trelis Life"}
          </button>
        )}
      </div>
    </main>
  );
}
