import type { ReactNode } from "react";
import "./StatCard.css";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  variant: "blue" | "orange" | "green" | "red";
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  variant,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>

      <div className={`stat-icon ${variant}`}>{icon}</div>
    </article>
  );
}