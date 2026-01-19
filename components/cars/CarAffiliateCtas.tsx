"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  car: any;
  variant?: "hero" | "footer";
};

export function CarAffiliateCtas({ car, variant = "hero" }: Props) {
  const isHero = variant === "hero";

  return (
    <div
      className={[
        "grid gap-3",
        isHero ? "mt-4" : "md:grid-cols-3",
      ].join(" ")}
    >
      {car.affiliate?.buy && (
        <Button asChild variant={isHero ? "outline" : "subtle"}>
          <Link href={car.affiliate.buy} target="_blank">
            中古車価格をチェック
          </Link>
        </Button>
      )}

      {car.affiliate?.insurance && (
        <Button asChild variant="outline">
          <Link href={car.affiliate.insurance} target="_blank">
            保険相場を見る
          </Link>
        </Button>
      )}

      {car.affiliate?.maintenance && (
        <Button asChild variant="outline">
          <Link href={car.affiliate.maintenance} target="_blank">
            維持費・消耗品を確認
          </Link>
        </Button>
      )}
    </div>
  );
}
