import React, { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Delta } from '../../../models/point';
import styles from './Blade.module.css';

export const Blade: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<Delta>({
    x: 0,
    y: 0,
    delta: { x: 0, y: 0 },
  });

  useEffect(() => {
    const mouseMove = fromEvent(document, 'mousemove')
      .pipe(
        tap((event) => {
          const mouseEvent = event as MouseEvent;
          const newPosition = {
            x: mouseEvent.pageX,
            y: mouseEvent.pageY,
          };
          setMousePosition((prevPosition) => ({
            ...newPosition,
            delta: {
              x: newPosition.x - prevPosition.x,
              y: newPosition.y - prevPosition.y,
            },
          }));
        })
      )
      .subscribe();

    return () => mouseMove.unsubscribe();
  }, []);

  return (
    <div
      className={styles.blade}
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transform: `rotate(${
          -Math.atan(-mousePosition.delta.y / mousePosition.delta.x) +
          Math.PI / 2 +
          (mousePosition.delta.x < 0 ? 0 : Math.PI)
        }rad)`,
      }}
    />
  );
};
