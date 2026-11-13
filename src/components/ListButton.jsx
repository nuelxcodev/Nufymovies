"use client";
import { BsBookmarkPlus, BsBookmarkCheckFill, BsBellFill, BsBell } from "react-icons/bs";
import { useProfile } from "./ProfileProvider";

// One button for both "My list" and "Remind me" (unreleased titles).
// variant: "icon" (poster corner) | "button" (movie page) | "overlay" (on hero images)
export default function ListButton({ item, remind = false, variant = "icon", className = "" }) {
  const { me, saved, save, unsave } = useProfile();
  if (!me || me.canSave === false) return null;
  const on = Boolean(saved[item.key]);
  const label = remind ? (on ? "Reminder on" : "Remind me") : on ? "In my list" : "My list";
  const Icon = remind ? (on ? BsBellFill : BsBell) : on ? BsBookmarkCheckFill : BsBookmarkPlus;
  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    on ? unsave(item.key) : save(item, remind);
  };

  if (variant === "icon")
    return (
      <button
        onClick={toggle}
        aria-pressed={on}
        aria-label={label}
        title={label}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-black/85 ${on ? "text-brand" : ""} ${className}`}
      >
        <Icon size={15} />
      </button>
    );
  const tone = variant === "overlay" ? "btn-overlay" : on ? "btn-outline" : "btn-ghost";
  return (
    <button onClick={toggle} aria-pressed={on} className={`btn ${tone} ${className}`}>
      <Icon size={16} /> {label}
    </button>
  );
}
