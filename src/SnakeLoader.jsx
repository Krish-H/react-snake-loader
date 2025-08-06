import React, { useEffect, useState, useRef } from "react";
import "./SnakeLoader.css";

const GRID_SIZE = 20;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 10;
const loadingText = "Loading...".split("");

const SnakeLoader = ({ backgroundImage , textColor }) => {
  const [snake, setSnake] = useState([{ x: 9, y: 5 }]);
  const [direction, setDirection] = useState("RIGHT");
  const [letters, setLetters] = useState([]);
  const [scatter, setScatter] = useState(false);
  const [grow, setGrow] = useState(false);
  const [started, setStarted] = useState(false);
 const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const intervalRef = useRef(null);

  useEffect(() => {
    setLetters(
      loadingText.map((char, i) => ({
        char,
        x: i + 5,
        y: 8,
        scattered: false,
        eaten: false,
      }))
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection("UP");
          break;
        case "ArrowDown":
          setDirection("DOWN");
          break;
        case "ArrowLeft":
          setDirection("LEFT");
          break;
        case "ArrowRight":
          setDirection("RIGHT");
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Mobile swipe control
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) setDirection("RIGHT");
        else if (dx < -20) setDirection("LEFT");
      } else {
        if (dy > 20) setDirection("DOWN");
        else if (dy < -20) setDirection("UP");
      }
    };

    const board = document.querySelector(".board");
    board.addEventListener("touchstart", handleTouchStart, { passive: true });
    board.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      board.removeEventListener("touchstart", handleTouchStart);
      board.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (started) {
      intervalRef.current = setInterval(moveSnake, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [started, direction, letters, grow]);

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
        default:
          break;
      }

      if (
        head.x < 0 ||
        head.x >= BOARD_WIDTH ||
        head.y < 0 ||
        head.y >= BOARD_HEIGHT
      ) {
        return prevSnake;
      }

      const index = letters.findIndex(
        (l) => !l.eaten && l.x === head.x && l.y === head.y
      );

      const newLetters = [...letters];
      if (index !== -1) {
        newLetters[index].eaten = true;
        setLetters(newLetters);
        setGrow(true);
      }

      let newSnake = [head, ...prevSnake];
      if (!grow) {
        newSnake.pop();
      } else {
        setGrow(false);
      }

      return newSnake;
    });
  };

  const handleHover = () => {
    if (started) return;

    setScatter(true);
    setStarted(true);

    setLetters(
      loadingText.map((char) => ({
        char,
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT),
        scattered: true,
        eaten: false,
      }))
    );

    setSnake([{ x: 9, y: 5 }]);
    setDirection("RIGHT");
  };

  const allEaten = letters.length > 0 && letters.every((l) => l.eaten);

  useEffect(() => {
    if (allEaten) {
      setTimeout(() => {
        setSnake([{ x: 9, y: 5 }]);
        setDirection("RIGHT");
        setGrow(false);
        setLetters(
          loadingText.map((char) => ({
            char,
            x: Math.floor(Math.random() * BOARD_WIDTH),
            y: Math.floor(Math.random() * BOARD_HEIGHT),
            scattered: true,
            eaten: false,
          }))
        );
      }, 1500);
    }
  }, [allEaten]);

 useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 600);
  };

  window.addEventListener("resize", handleResize);

  handleResize();

  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
    <div className="snake-container">
      {backgroundImage && (
        <div
          className="snake-blur-bg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      <div style={{ position: "relative" }}>
        <div className="board board-ani" onMouseEnter={handleHover}>
          {[...Array(BOARD_HEIGHT)].map((_, row) =>
            [...Array(BOARD_WIDTH)].map((_, col) => {
              const isHead = snake[0].x === col && snake[0].y === row;
              const isSnake = snake.some((s) => s.x === col && s.y === row);
              return (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${isSnake ? "snake" : ""} ${
                    isHead ? "snake-head" : ""
                  }`}
                />
              );
            })
          )}
          {letters.map(
            (letter, i) =>
              !letter.eaten && (
                <div
                  key={i}
                  className={`letter ${!started && "fade-text"}`}
                  style={{
                    left: `${letter.x * GRID_SIZE}px`,
                    top: `${letter.y * GRID_SIZE}px`,
                  }}
                >
                  {letter.char}
                </div>
              )
          )}
        </div>
      </div>
      {started && (
        <div
        
          className="animated-loading-text"
    style={{
      color: !isMobile && textColor ? textColor : undefined,
    }}
        >{loadingText.join("")}</div>
      )}
    </div>
  );
};

export default SnakeLoader;
