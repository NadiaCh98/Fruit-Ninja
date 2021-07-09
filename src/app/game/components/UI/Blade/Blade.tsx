import { uniq, uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { fromEvent, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Delta, Point } from '../../../models/point';
import styles from './Blade.module.css';

// const getBladeSidePositions = (position: Delta, index: number): [Point, Point] =>  {
//     return position.delta.y === 0 || position.delta.x === 0  ? [{
//         x: position.delta.y === 0 ? position.x : position.x + index * 2,
//         y: position.delta.x === 0 ? position.y : position.y + index * 2
//     }, {
//         x: position.delta.y === 0 ? position.x : position.x - index * 2,
//         y: position.delta.x === 0 ? position.y : position.y - index * 2
//     }] : position.delta.x > 0 ? [
//         {
//             x: 
//         }
//     ]
// };

// const convertMousePositionToBlade = (mousePositions: Delta[]): string => {
//     const rightPositions: Point[] = [];
//     const leftPositions: Point[] = [];
//     mousePositions.forEach((pos, i) => {
//         const rightPosition: Point = pos.delta.x === 0 ? {
//             x: pos.x,
//             y: pos.y + i * 10
//         } 
//         rightPositions.push({x: pos.x, y: pos.y + i * 10});
//         leftPositions.push({x: pos.x, y: pos.y - i * 10});
//         if (mousePositions.length - i === 1) {
//             // rightPositions.push({

//             // })
//         }
//     })
//     return [...rightPositions, ...leftPositions.reverse()].map(v => `${v.x} ${v.y}`).join(',');
// }

export const Blade: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<Delta>({
    x: 0,
    y: 0,
    delta: { x: 0, y: 0 },
  });
  const bladeParts = useRef<Delta[]>([]);

  useEffect(() => {
    const mouseMove$ = fromEvent(document, 'mousemove').pipe(
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
    );

    const removeOldParts = interval(500)
      .pipe(
        tap(() => {
          bladeParts.current = bladeParts.current.slice(-1);
        })
      )
      .subscribe();

    removeOldParts.add(mouseMove$.subscribe());

    return () => removeOldParts.unsubscribe();
  }, []);

  useEffect(() => {
    bladeParts.current.push(mousePosition);
    // console.log((-Math.atan(-mousePosition.delta.y / mousePosition.delta.x) + Math.PI / 2 + (mousePosition.delta.x < 0 ? Math.PI : 0)) * 180 / Math.PI)
  }, [mousePosition]);

  //   return (
  //     <>
  //       {bladeParts.current.map((value, i) => (
  //         <div
  //           key={i}
  //           className={styles.blade}
  //           style={{
  //             left: `${value.x}px`,
  //             top: `${value.y}px`,
  //             transform: `rotate(${
  //               -Math.atan(-value.delta.y / value.delta.x) +
  //               Math.PI / 2 +
  //               (i === 0 ? 0 : Math.PI)
  //             }rad)`,
  //           }}
  //         />
  //       ))}
  //     </>
  //   );

  return (
    <>
      {/* <svg style={{ zIndex: 3, position: 'absolute', height: document.body.clientHeight, width: document.body.clientWidth }}>
        <polyline
            points={bladeParts.current.map(value => `${value.x} ${value.y}`).join(',')}
        //   points="546 406,548 407,555 407,575 407,613 407,657 407"
          style={{ stroke: 'black', strokeWidth: 3, strokeLinecap: 'butt', strokeLinejoin: 'miter', fill: 'none' }}
        />
      </svg> */}
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
    </>
  );
};

