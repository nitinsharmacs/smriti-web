import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "src/App";

describe('App', () => {
  it('should render App', () => {
    render(<App />)
    expect(screen.getByText("Vite + React")).toBeInTheDocument()
  })
})