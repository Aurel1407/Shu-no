import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  StatsSkeleton,
  ChartSkeleton,
  TableSkeleton,
  FormSkeleton,
  PropertyCardSkeleton,
  ContactCardSkeleton,
} from "./skeletons";

describe("Skeleton Components", () => {
  describe("StatsSkeleton", () => {
    it("should render stats skeleton correctly", () => {
      render(<StatsSkeleton />);

      expect(screen.getByTestId("stats-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("stats-skeleton")).toHaveClass("animate-pulse");
    });

    it("should have proper accessibility attributes", () => {
      render(<StatsSkeleton />);

      const skeleton = screen.getByTestId("stats-skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Chargement des statistiques...");
      expect(skeleton).toHaveAttribute("role", "status");
    });
  });

  describe("ChartSkeleton", () => {
    it("should render chart skeleton correctly", () => {
      render(<ChartSkeleton />);

      expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("chart-skeleton")).toHaveClass("animate-pulse");
    });

    it("should have proper accessibility attributes", () => {
      render(<ChartSkeleton />);

      const skeleton = screen.getByTestId("chart-skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Chargement du graphique...");
      expect(skeleton).toHaveAttribute("role", "status");
    });
  });

  describe("TableSkeleton", () => {
    it("should render table skeleton correctly", () => {
      render(<TableSkeleton />);

      expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("table-skeleton")).toHaveClass("animate-pulse");
    });

    it("should render with custom number of rows", () => {
      render(<TableSkeleton rows={3} />);

      const skeleton = screen.getByTestId("table-skeleton");
      expect(skeleton).toBeInTheDocument();

      // Vérifier que les lignes du tableau sont présentes
      const rows = skeleton.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(4); // 1 header + 3 data rows
    });

    it("should render with custom number of columns", () => {
      render(<TableSkeleton columns={5} />);

      const skeleton = screen.getByTestId("table-skeleton");
      expect(skeleton).toBeInTheDocument();

      // Vérifier que les colonnes sont présentes
      const headerCells = skeleton.querySelectorAll('thead [role="columnheader"]');
      expect(headerCells).toHaveLength(5);
    });

    it("should have proper accessibility attributes", () => {
      render(<TableSkeleton />);

      const skeleton = screen.getByTestId("table-skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Chargement du tableau...");
      expect(skeleton).toHaveAttribute("role", "status");
    });
  });

  describe("FormSkeleton", () => {
    it("should render form skeleton correctly", () => {
      render(<FormSkeleton />);

      expect(screen.getByTestId("form-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("form-skeleton")).toHaveClass("animate-pulse");
    });

    it("should have proper accessibility attributes", () => {
      render(<FormSkeleton />);

      const skeleton = screen.getByTestId("form-skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Chargement...");
      expect(skeleton).toHaveAttribute("role", "status");
    });
  });

  describe("PropertyCardSkeleton", () => {
    it("should render property card skeleton correctly", () => {
      render(<PropertyCardSkeleton />);

      expect(screen.getByTestId("property-card-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("property-card-skeleton")).toHaveClass("animate-pulse");
    });

    it("should render multiple property card skeletons", () => {
      render(
        <div>
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      );

      const skeletons = screen.getAllByTestId("property-card-skeleton");
      expect(skeletons).toHaveLength(3);
    });

    it("should have proper accessibility attributes", () => {
      render(<PropertyCardSkeleton />);

      const skeleton = screen.getByTestId("property-card-skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Chargement de la propriété...");
      expect(skeleton).toHaveAttribute("role", "status");
    });
  });

  describe("All skeletons animation", () => {
    it("should all have pulse animation class", () => {
      render(
        <div>
          <StatsSkeleton />
          <ChartSkeleton />
          <TableSkeleton />
          <FormSkeleton />
          <PropertyCardSkeleton />
        </div>
      );

      const statsSkele = screen.getByTestId("stats-skeleton");
      const chartSkele = screen.getByTestId("chart-skeleton");
      const tableSkele = screen.getByTestId("table-skeleton");
      const formSkele = screen.getByTestId("form-skeleton");
      const propSkele = screen.getByTestId("property-card-skeleton");

      expect(statsSkele).toHaveClass("animate-pulse");
      expect(chartSkele).toHaveClass("animate-pulse");
      expect(tableSkele).toHaveClass("animate-pulse");
      expect(formSkele).toHaveClass("animate-pulse");
      expect(propSkele).toHaveClass("animate-pulse");
    });
  });

  describe("Skeleton structure", () => {
    it("should render with proper card structure for card-like skeletons", () => {
      render(<StatsSkeleton />);

      const skeleton = screen.getByTestId("stats-skeleton");
      expect(skeleton.querySelector(".bg-muted")).toBeInTheDocument();
    });

    it("should render table skeleton with proper table structure", () => {
      render(<TableSkeleton />);

      const skeleton = screen.getByTestId("table-skeleton");
      expect(skeleton.querySelector("table")).toBeInTheDocument();
      expect(skeleton.querySelector("thead")).toBeInTheDocument();
      expect(skeleton.querySelector("tbody")).toBeInTheDocument();
    });
  });
});
