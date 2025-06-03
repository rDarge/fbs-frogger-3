
"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the Square interface at the file scope
interface Square {
  x: number;
  y: number;
  dy: number; // Direction factor: 1 for down, -1 for up
  isVisible: boolean;
  disappearTimer: NodeJS.Timeout | null;
}

const CANVAS_WIDTH = 880; // Adjusted width to accommodate blue column
const CANVAS_HEIGHT = 600;
const CIRCLE_RADIUS = 20;
const CIRCLE_COLOR = "#FFFF00"; // Yellow
const SQUARE_SIZE = 40; // Size of the square obstacles
const SQUARE_COLOR = "#FF0000"; // Red
const MOVEMENT_SPEED = 5; // Speed for the yellow circle
const BLUE_COLUMN_COLOR = "#0000FF"; // Blue
const BLUE_COLUMN_WIDTH = SQUARE_SIZE;

// Function to generate the grid of squares with blue column on the right
const generateGrid = (width: number, height: number, size: number): Square[] => {
  const grid: Square[] = [];
  const gridWidth = width - BLUE_COLUMN_WIDTH; // Width available for grid

  for (let x = 3 * size; x < gridWidth - size; x += 2 * size) { // Adjusted condition
    for (let y = size; y < height - size; y += 2 * size) {
      if (Math.random() < 0.3) {
        grid.push({
          x,
          y,
          dy: Math.random() > 0.5 ? 1 : -1, // Random vertical direction
          isVisible: true,
          disappearTimer: null,
        });
      }
    }
  }
  return grid;
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circleRef = useRef({
    x: CIRCLE_RADIUS, // Start at left edge
    y: CANVAS_HEIGHT / 2,
  });

  const gridRef = useRef<Square[]>(generateGrid(CANVAS_WIDTH, CANVAS_HEIGHT, SQUARE_SIZE));
  const [showAlert, setShowAlert] = useState(false);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SQUARE_SPEED = 2; // Speed of red squares
  const SQUARE_DISAPPEAR_DURATION = 3000; // 3 seconds

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const drawElements = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw the background
      ctx.fillStyle = 'hsl(var(--background))'; // Use theme background color
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


      // Draw the squares
      gridRef.current.forEach((square) => {
        if (square.isVisible) {
          ctx.fillStyle = SQUARE_COLOR;
          ctx.fillRect(
            square.x - SQUARE_SIZE / 2,
            square.y - SQUARE_SIZE / 2,
            SQUARE_SIZE,
            SQUARE_SIZE
          );
        }
      });

      // Draw the blue column on the right
      ctx.fillStyle = BLUE_COLUMN_COLOR;
      ctx.fillRect(
        CANVAS_WIDTH - BLUE_COLUMN_WIDTH, // Start from the right edge
        0,
        BLUE_COLUMN_WIDTH,
        CANVAS_HEIGHT
      );

      // Draw the circle
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

    const updateSquares = () => {
      gridRef.current.forEach((square) => {
        if (square.isVisible) {
          square.y += square.dy * SQUARE_SPEED;

          const hitTop = square.y - SQUARE_SIZE / 2 < 0 && square.dy < 0;
          const hitBottom = square.y + SQUARE_SIZE / 2 > CANVAS_HEIGHT && square.dy > 0;

          if (hitTop || hitBottom) {
            square.isVisible = false;
            if (square.disappearTimer) {
              clearTimeout(square.disappearTimer);
            }
            square.disappearTimer = setTimeout(() => {
              square.isVisible = true;
              if (hitTop) {
                square.y = CANVAS_HEIGHT - SQUARE_SIZE / 2; // Reappear at the bottom
              } else { // hitBottom
                square.y = SQUARE_SIZE / 2; // Reappear at the top
              }
              // dy remains unchanged, so it continues in the same direction
              square.disappearTimer = null;
            }, SQUARE_DISAPPEAR_DURATION);
          }
        }
      });
    };

    const gameLoop = () => {
      updateSquares();
      drawElements();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showAlert) return; // Don't move if alert is shown

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

      newX = Math.max(
        CIRCLE_RADIUS,
        Math.min(newX, CANVAS_WIDTH - CIRCLE_RADIUS - BLUE_COLUMN_WIDTH)
      );
      newY = Math.max(
        CIRCLE_RADIUS,
        Math.min(newY, CANVAS_HEIGHT - CIRCLE_RADIUS)
      );

      let collision = false;
      for (const square of gridRef.current) {
        if (!square.isVisible) continue; // Ignore invisible squares for collision

        const dx = newX - square.x;
        const dy = newY - square.y;
        const combinedHalfWidths = SQUARE_SIZE / 2 + CIRCLE_RADIUS;
        if (
          Math.abs(dx) < combinedHalfWidths &&
          Math.abs(dy) < combinedHalfWidths
        ) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        circleRef.current.x = newX;
        circleRef.current.y = newY;
      } else {
        setShowAlert(true);
        circleRef.current.x = CIRCLE_RADIUS;
        circleRef.current.y = CANVAS_HEIGHT / 2;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      gridRef.current.forEach(square => {
        if (square.disappearTimer) {
          clearTimeout(square.disappearTimer);
        }
      });
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [showAlert]); // Add showAlert to dependencies to re-evaluate if needed, though not strictly necessary for listeners

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-green-500">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-400 rounded-md shadow-lg"
      />
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ouch!</AlertDialogTitle>
            <AlertDialogDescription>
              You hit a red square! Back to the start.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlertClose}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
