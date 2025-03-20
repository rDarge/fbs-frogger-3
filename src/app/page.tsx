"use client";

import React, { useRef, useEffect } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CIRCLE_RADIUS = 20;
const CIRCLE_COLOR = "#FFFF00"; // Yellow
const MOVEMENT_SPEED = 5;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circleRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const drawCircle = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.arc(
        circleRef.current.x,
        circleRef.current.y,
        CIRCLE_RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = CIRCLE_COLOR;
      ctx.fill();
    };

    const gameLoop = () => {
      drawCircle();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          circleRef.current.y -= MOVEMENT_SPEED;
          break;
        case "ArrowDown":
          circleRef.current.y += MOVEMENT_SPEED;
          break;
        case "ArrowLeft":
          circleRef.current.x -= MOVEMENT_SPEED;
          break;
        case "ArrowRight":
          circleRef.current.x += MOVEMENT_SPEED;
          break;
      }

      // Prevent circle from going off-screen
      circleRef.current.x = Math.max(
        CIRCLE_RADIUS,
        Math.min(circleRef.current.x, CANVAS_WIDTH - CIRCLE_RADIUS)
      );
      circleRef.current.y = Math.max(
        CIRCLE_RADIUS,
        Math.min(circleRef.current.y, CANVAS_HEIGHT - CIRCLE_RADIUS)
      );
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);

    gameLoop();

    // Clean up function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-400 rounded-md shadow-lg"
      />
    </div>
  );
}
