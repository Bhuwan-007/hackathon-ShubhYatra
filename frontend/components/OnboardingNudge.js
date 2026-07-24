"use client";
import { useState, useEffect } from "react";
import { X, Search, Users, AlertTriangle, Camera, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingNudge() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show on first visit
    const hasOnboarded = localStorage.getItem("aegis_onboarded");
    if (!hasOnboarded) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("aegis_onboarded", "true");
    setIsVisible(false);
  };

  const handleNext = () => {
    if (step === 4) {
      handleDismiss();
    } else {
      setStep(prev => prev + 1);
    }
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "Search Destinations",
      desc: "Try searching a destination like Paharganj, Delhi to get AI-curated safety briefings.",
      icon: <Search className="w-6 h-6 text-primary" />
    },
    {
      title: "Scam Scanner",
      desc: "Not sure about a taxi meter or menu? Snap a photo to get an instant AI safety check.",
      icon: <Camera className="w-6 h-6 text-primary" />
    },
    {
      title: "Report Hazards",
      desc: "Spot a hazard? Report it to help others stay safe using the Report button.",
      icon: <AlertTriangle className="w-6 h-6 text-primary" />
    },
    {
      title: "Emergency Hub",
      desc: "In trouble? Get instant step-by-step action plans and local emergency numbers tailored to your crisis.",
      icon: <Phone className="w-6 h-6 text-primary" />
    },
    {
      title: "Yatri Connect",
      desc: "Opt in to meet verified nearby travelers securely using the Connect icon in the nav.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
  ];

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-background-dark/95 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            {steps[step].icon}
          </div>
          <div>
            <div className="text-xs font-bold text-primary-dark tracking-wider uppercase mb-1">
              Tip {step + 1} of 5
            </div>
            <h4 className="text-white font-bold mb-1">{steps[step].title}</h4>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              {steps[step].desc}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                {step === 4 ? "Got it!" : "Next"}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 text-white/60 hover:text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
