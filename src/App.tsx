import { useEffect, useState } from 'react';
import * as C from './App.styles';
import logoImage from './assets/devmemory_logo.png';
import RestartIcon from './svgs/restart.svg';
import { Button } from './components/button';
import { InfoItem } from './components/infoitem';
import { GridItem } from './components/GridItem';
import { GridItemType } from './types/GridItemType';
import { items } from './data/items';
import { formatTimeElapsed } from './helpers/formatTimeElapsed';

export function App() {
  const [playing, setPlaying] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [shownCount, setShowCount] = useState<number>(0);
  const [gridItems, setGridItems] = useState<GridItemType[]>([]);

  useEffect(() => handleResetAndCreateGrid(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (playing) setTimeElapsed(timeElapsed + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, timeElapsed]);

  // verify if opened are equal
  useEffect(() => {
    if (shownCount == 2) {
      let opened = gridItems.filter((item) => item.shown == true);
      if (opened.length === 2) {
        if (opened[0].item === opened[1].item) {
          // v1 - if both are equal, make every "shown" permanent
          let tmpGrid = [...gridItems];
          for (let i in tmpGrid) {
            if (tmpGrid[i].shown) {
              tmpGrid[i].permanentShown = true;
              tmpGrid[i].shown = false;
            }
          }
          setGridItems(tmpGrid);
          setShowCount(0);
        } else {
          // v2 - if not equal, close all "shown"
          setTimeout(() => {
            let tmpGrid = [...gridItems];
            for (let i in tmpGrid) {
              tmpGrid[i].shown = false;
            }
            setGridItems(tmpGrid);
            setShowCount(0);
          }, 1000);
        }

        setMoveCount((moveCount) => moveCount + 1);
      }
    }
  }, [shownCount, gridItems]);

  // verify if game is over
  useEffect(() => {
    if (moveCount > 0 && gridItems.every((item) => item.permanentShown === true)) {
      setPlaying(false);
    }
  }, [moveCount, gridItems]);

  const handleItemClick = (index: number) => {
    if (playing && index !== null && shownCount < 2) {
      let tmpGrid = [...gridItems];
      if (
        tmpGrid[index].permanentShown === false &&
        tmpGrid[index].shown === false
      ) {
        tmpGrid[index].shown = true;
        setShowCount(shownCount + 1);
      }
      setGridItems(tmpGrid);
    }
  };

  const handleResetAndCreateGrid = () => {
    // setep 1: reset the game
    setTimeElapsed(0);
    setMoveCount(0);
    setShowCount(0);

    // setep 2: create a new grid

    // setep 2.1 - create a empty grid
    let tmpGrid: GridItemType[] = [];
    for (let i = 0; i < items.length * 2; i++) {
      tmpGrid.push({ item: null, shown: false, permanentShown: false });
    }

    // setep 2.2 - shuffle the grid
    for (let w = 0; w < 2; w++) {
      for (let i = 0; i < items.length; i++) {
        let pos = -1;
        while (pos < 0 || tmpGrid[pos].item !== null) {
          pos = Math.floor(Math.random() * (items.length * 2));
        }
        tmpGrid[pos].item = i;
      }
    }

    // setep 2.3 - throw into state
    setGridItems(tmpGrid);

    // setep 3: start the game
    setPlaying(true);
  };

  return (
    <C.Container>
      <C.Info>
        <C.LogoLink href="">
          <img src={logoImage} width="200" alt="" />
        </C.LogoLink>

        <C.InfoArea>
          <InfoItem label="Tempo" value={formatTimeElapsed(timeElapsed)} />
          <InfoItem label="Movimentos" value={moveCount.toString()} />
        </C.InfoArea>

        <Button
          label="Reiniciar"
          icon={RestartIcon}
          onClick={handleResetAndCreateGrid}
        />
      </C.Info>

      <C.GridArea>
        <C.Grid>
          {gridItems.map((item, index) => (
            <GridItem
              key={index}
              item={item}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </C.Grid>
      </C.GridArea>
    </C.Container>
  );
}
