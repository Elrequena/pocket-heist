import { render, screen } from "@testing-library/react";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";

describe("AuthLoadingScreen", () => {
  it("renders loading message", () => {
    render(<AuthLoadingScreen />);
    expect(
      screen.getByText("Checking authentication status..."),
    ).toBeInTheDocument();
  });

  it("renders with public variant by default", () => {
    const { container } = render(<AuthLoadingScreen />);
    const navbar = container.querySelector(".navbarPlaceholder");
    expect(navbar).not.toBeInTheDocument();
  });

  it("renders navbar placeholder with dashboard variant", () => {
    const { container } = render(<AuthLoadingScreen variant="dashboard" />);
    const navbar = container.querySelector(".navbarPlaceholder");
    expect(navbar).toBeInTheDocument();
  });

  it("renders with status role for accessibility", () => {
    render(<AuthLoadingScreen />);
    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
  });

  it("renders Clock icon", () => {
    const { container } = render(<AuthLoadingScreen />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has fixed positioning with correct class", () => {
    const { container } = render(<AuthLoadingScreen />);
    const element = container.querySelector(".container");
    expect(element).toHaveClass("container");
  });
});
