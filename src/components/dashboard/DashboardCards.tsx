import { useEffect, useState } from "react";
import MetricCard from "../common/Metric-Card";

type CardData = {
  title: string;
  value: string;
  percentage: string;
  description: string;
  sub_desc: string;
  performance_indicator: "up" | "down";
};

type DashboardResponse = {
  cards: CardData[];
};

function DashboardCards() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/dashboard"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch dashboard cards"
          );
        }

        const data: DashboardResponse =
          await response.json();

        setCards(data.cards);
        setError(null);
      } catch (error) {
        console.error(
          "Dashboard cards error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard cards"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            Overview
          </h2>

          <p className="text-sm text-muted-foreground">
            Monitor your ecommerce performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border bg-muted/30"
              />
            )
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            Overview
          </h2>

          <p className="text-sm text-muted-foreground">
            Monitor your ecommerce performance.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Overview
        </h2>

        <p className="text-sm text-muted-foreground">
          Monitor your ecommerce performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            {...card}
          />
        ))}
      </div>
    </div>
  );
}

export default DashboardCards;