"use client";

import React, { useRef, useEffect } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CIRCLE_RADIUS = 20;
const CIRCLE_COLOR = "#FFFF00"; // Yellow
const SQUARE_SIZE = 40; // Size of the square obstacles
const SQUARE_COLOR = "#FF0000"; // Red
const MOVEMENT_SPEED = 5;

// Function to generate the grid of squares
const generateGrid = (width: number, height: number, size: number) => {
  const grid = [];
  for (let x = size; x < width - size; x += 2 * size) {
    for (let y = size; y < height - size; y += 2 * size) {
      grid.push({ x, y });
    }
  }
  return grid;
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circleRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
  });

  // Generate the grid of squares
  const gridRef = useRef(generateGrid(CANVAS_WIDTH, CANVAS_HEIGHT, SQUARE_SIZE));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const drawCircle = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw the squares
      gridRef.current.forEach((square) => {
        ctx.fillStyle = SQUARE_COLOR;
        ctx.fillRect(
          square.x - SQUARE_SIZE / 2,
          square.y - SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE
        );
      });

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
      let newX = circleRef.current.x;
      let newY = circleRef.current.y;

      switch (event.key) {
        case "ArrowUp":
          newY -= MOVEMENT_SPEED;
          break;
        case "ArrowDown":
          newY += MOVEMENT_SPEED;
          break;
        case "ArrowLeft":
          newX -= MOVEMENT_SPEED;
          break;
        case "ArrowRight":
          newX += MOVEMENT_SPEED;
          break;
      }

      // Prevent circle from going off-screen
      newX = Math.max(
        CIRCLE_RADIUS,
        Math.min(newX, CANVAS_WIDTH - CIRCLE_RADIUS)
      );
      newY = Math.max(
        CIRCLE_RADIUS,
        Math.min(newY, CANVAS_HEIGHT - CIRCLE_RADIUS)
      );

      // Collision detection with squares
      let collision = false;
      for (const square of gridRef.current) {
        const dx = newX - square.x;
        const dy = newY - square.y;
        const combinedHalfWidths = SQUARE_SIZE / 2 + CIRCLE_RADIUS;
        if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfWidths) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        circleRef.current.x = newX;
        circleRef.current.y = newY;
      }
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
    <div className="flex items-center justify-center h-screen bg-green-500">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-400 rounded-md shadow-lg"
      />
    </div>
  );
}
