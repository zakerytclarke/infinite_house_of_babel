//const seed = new Date().getTime();
const seed = 123456;
const random = mulberry32(seed);

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const world = new Map();
const currentPosition = { x: 0, y: 0 };
let lastDirection = 'north';

function getKey(x, y) {
  return `${x},${y}`;
}

const coordinateConstraints = {
    '1,-6':  { north: true, south: true, east: true,  west: true },
    '2,-6':  { north: true, south: false, east: true, west: true },
    '3,-6':  { north: true, south: true, east: true,  west: true },
    '4,-6':  { north: true, south: false, east: true, west: true },
    '5,-6':  { north: true, south: true, east: true,  west: true },
    '6,-6':  { north: true, south: false, east: true, west: true },
    '7,-6':  { north: true, south: true, east: true,  west: true },
    '8,-6':  { north: true, south: true, east: true,  west: true },
    '9,-6':  { north: true, south: true, east: true,  west: true },
    '10,-6': { north: true, south: false, east: true, west: true },
    '11,-6': { north: true, south: true, east: true,  west: true }
  };
  

  function getValidRooms(x, y, world, roomTemplates) {
    const key = getKey(x, y);
    const specificConstraint = coordinateConstraints[key];
  
    return roomTemplates.slice(1).filter((room) => {
      // 1. No repeat of adjacent room types
      for (const { dx, dy } of [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
      ]) {
        const neighbor = world.get(getKey(x + dx, y + dy));
        if (neighbor && neighbor.filename === room.filename) {
          return false;
        }
      }
  
      // 2. Ensure door compatibility
      const neighbors = [
        { dx: 0, dy: -1, dir: 'north', opp: 'south' },
        { dx: 0, dy: 1, dir: 'south', opp: 'north' },
        { dx: 1, dy: 0, dir: 'east', opp: 'west' },
        { dx: -1, dy: 0, dir: 'west', opp: 'east' },
      ];
  
      let unseenNeighbors = [];
  
      for (const { dx, dy, dir, opp } of neighbors) {
        const neighbor = world.get(getKey(x + dx, y + dy));
        if (neighbor) {
          const neighborHasDoor = neighbor.doors[opp];
          const roomHasDoor = room.doors[dir];
  
          if (neighborHasDoor && !roomHasDoor) return false;
          if (!neighborHasDoor && roomHasDoor) return false;
        } else {
          unseenNeighbors.push({ dx, dy, dir });
        }
      }
  
      // 3. Ensure path to sole unseen neighbor
      if (unseenNeighbors.length === 1) {
        const only = unseenNeighbors[0];
        if (!room.doors[only.dir]) return false;
      }
  
      // 4. Enforce fixed door constraints
      if (specificConstraint) {
        for (const dir of ['north', 'south', 'east', 'west']) {
          if (room.doors[dir] !== specificConstraint[dir]) return false;
        }
      }
  
      // 5. Prevent creatind dead-end paths for neighbors
      const blockingDirs = getBlockingDirectionsIfRoomPlaced(x, y, room, world);
      console.log("blocking")
      console.log(blockingDirs);
      if (blockingDirs.length > 0) {
        for (const dir of blockingDirs) {
          if (!room.doors[dir]) return false;
        }
      }
  
      return true;
    }).map(room => ({ ...room }));
  }
  
  function floodFill({ 
    startX, 
    startY, 
    world, 
    maxDepth = 5,
    shouldInclude = () => true,
    shouldContinue = () => true
  }) {
    const visited = new Set();
  
    function recurse(x, y, depth) {
      const key = getKey(x, y);
      const room = world.get(key);
      if (!room || visited.has(key) || depth > maxDepth) return;
      if (!shouldInclude(x, y, room)) return;
  
      visited.add(key);
  
      if (!shouldContinue(x, y, room, depth)) return;
  
      const dirs = {
        north: [0, -1],
        south: [0, 1],
        east: [1, 0],
        west: [-1, 0]
      };
  
      for (const dir in dirs) {
        if (!room.doors[dir]) continue;
        const [dx, dy] = dirs[dir];
        const nx = x + dx;
        const ny = y + dy;
        const neighbor = world.get(getKey(nx, ny));
        const opp = { north: 'south', south: 'north', east: 'west', west: 'east' }[dir];
        if (neighbor && neighbor.doors[opp]) {
          recurse(nx, ny, depth + 1);
        }
      }
    }
  
    recurse(startX, startY, 0);
    return visited;
  }
  
  function getBlockingDirectionsIfRoomPlaced(x, y, room, world) {
    const testWorld = new Map(world);
    testWorld.set(getKey(x, y), room);
  
    const neighborOffsets = [
      { dx: 0, dy: -1, dir: 'north', opp: 'south' },
      { dx: 0, dy: 1, dir: 'south', opp: 'north' },
      { dx: 1, dy: 0, dir: 'east', opp: 'west' },
      { dx: -1, dy: 0, dir: 'west', opp: 'east' }
    ];
  
    const blockedDirs = [];
  
    for (const { dx, dy, dir, opp } of neighborOffsets) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = world.get(getKey(nx, ny));
  
      if (
        neighbor &&
        neighbor.doors[opp] &&
        room.doors[dir]
      ) {
        const visited = floodFill({
          startX: nx,
          startY: ny,
          world: testWorld,
          maxDepth: 5,
          shouldInclude: (x2, y2) => getKey(x2, y2) !== getKey(x, y),
          shouldContinue: () => true
        });
  
        if (visited.size <= 1) {
          blockedDirs.push(dir);
        }
      }
    }
  
    return blockedDirs;
  }
  
  
// function getValidRooms(x, y, world, roomTemplates) {
//   return roomTemplates.slice(1).filter((room) => {
//     for (const { dx, dy } of [
//       { dx: 0, dy: -1 },
//       { dx: 0, dy: 1 },
//       { dx: 1, dy: 0 },
//       { dx: -1, dy: 0 }
//     ]) {
//       const neighbor = world.get(getKey(x + dx, y + dy));
//       if (neighbor && neighbor.filename === room.filename) {
//         return false;
//       }
//     }

//     const neighbors = [
//       { dx: 0, dy: -1, dir: 'north', opp: 'south' },
//       { dx: 0, dy: 1, dir: 'south', opp: 'north' },
//       { dx: 1, dy: 0, dir: 'east', opp: 'west' },
//       { dx: -1, dy: 0, dir: 'west', opp: 'east' }
//     ];

//     let unseenNeighbors = [];

//     for (const { dx, dy, dir, opp } of neighbors) {
//       const neighbor = world.get(getKey(x + dx, y + dy));
//       if (neighbor) {
//         const neighborHasDoor = neighbor.doors[opp];
//         const roomHasDoor = room.doors[dir];

//         if (neighborHasDoor && !roomHasDoor) return false;
//         if (!neighborHasDoor && roomHasDoor) return false;
//       } else {
//         unseenNeighbors.push({ dx, dy, dir });
//       }
//     }

//     if (unseenNeighbors.length === 1) {
//       const only = unseenNeighbors[0];
//       if (!room.doors[only.dir]) return false;
//     }

//     return true;
//   }).map(room => ({ ...room }));
// }

function applyRoomWeights(x, y, validRooms) {
  return validRooms.map(room => {
    const numDoors = Object.values(room.doors).filter(Boolean).length;

    let bias = 0;
    if (x > 0 && room.doors.west) bias++;
    if (x < 0 && room.doors.east) bias++;
    if (y > 0 && room.doors.north) bias++;
    if (y < 0 && room.doors.south) bias++;

    const baseWeight = room.doors.north + room.doors.south + room.doors.east + room.doors.west;
    // const weight = baseWeight + numDoors * Math.pow(10, numDoors) + bias * 4;
    const weight = baseWeight + numDoors * 2 + bias * 4;
    console.log(room.name, numDoors, weight)
    return { ...room, weight };
  }).sort((a, b) => b.weight - a.weight);
}

function weightedRandomChoice(items, rng) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const threshold = rng() * totalWeight;
  let running = 0;
  for (const item of items) {
    running += item.weight;
    if (running >= threshold) {
      return item;
    }
  }
  return items[items.length - 1];
}

function matchRoom(x, y) {
  const validRooms = getValidRooms(x, y, world, roomTemplates);
  if (validRooms.length === 0) {
    const neighbors = [
      { dx: 0, dy: -1, dir: 'north', opp: 'south' },
      { dx: 0, dy: 1, dir: 'south', opp: 'north' },
      { dx: 1, dy: 0, dir: 'east', opp: 'west' },
      { dx: -1, dy: 0, dir: 'west', opp: 'east' }
    ];
    const required = neighbors
      .filter(({ dx, dy, opp }) => {
        const neighbor = world.get(getKey(x + dx, y + dy));
        return neighbor && neighbor.doors[opp];
      })
      .map(n => n.dir).join(', ');
    alert(`No matching rooms found. Required doors (from neighbors): ${required}`);
    return null;
  }

  const weightedRooms = applyRoomWeights(x, y, validRooms);
  return weightedRandomChoice(weightedRooms, random);
}

function generateRoom(x, y, fromDirection) {
  const key = getKey(x, y);
  const isSecondRoom = world.size === 1;

  const baseRoom = isSecondRoom
    ? { ...roomTemplates[1], id: 1 }
    : matchRoom(x, y);

  if (baseRoom) {
    const roomInstance = {
      ...baseRoom,
      x,
      y,
      uid: `${baseRoom.id}-${x}-${y}`
    };
    world.set(key, roomInstance);
  }
}

function updateCompass() {
  const dx = 0 - currentPosition.x;
  const dy = 0 - currentPosition.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (dx === 0 && dy === 0) {
    angle = 0 - 90 - 45;
  }
  const compass = document.getElementById('compass');
  compass.style.transform = `rotate(${angle + 90 + 45}deg)`;
}

function renderRoom() {
  const key = getKey(currentPosition.x, currentPosition.y);
  let room = world.get(key);
  if (!room) {
    generateRoom(currentPosition.x, currentPosition.y, lastDirection);
    room = world.get(key);
  }
  const img = document.getElementById('roomImage');
  img.style.visibility = 'hidden';
  img.onload = () => {
    img.style.transform = room.flipped ? 'scaleX(-1)' : 'scaleX(1)';
    ['north', 'south', 'east', 'west'].forEach(dir => {
      document.getElementById(dir).style.display = room.doors[dir] ? 'block' : 'none';
    });
    img.style.visibility = 'visible';
    updateCompass();
    renderMap();
  };
  img.src = `rooms/${room.filename}`;
}

function move(dir) {
  lastDirection = dir;
  switch (dir) {
    case 'north': currentPosition.y -= 1; break;
    case 'south': currentPosition.y += 1; break;
    case 'east': currentPosition.x += 1; break;
    case 'west': currentPosition.x -= 1; break;
  }
  renderRoom();
}

function renderMap(size = 2) {
    const mapGrid = document.getElementById('mapGrid');
    mapGrid.innerHTML = '';
    mapGrid.style.gridTemplateColumns = `repeat(${size * 2 + 1}, 1fr)`; // Dynamically set columns
  
    const cx = currentPosition.x;
    const cy = currentPosition.y;
  
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const key = getKey(x, y);
        const room = world.get(key);
        const cell = document.createElement('div');
        cell.className = 'mapCell';
  
        if (x === cx && y === cy) {
          cell.classList.add('current');
        }
  
        if (room) {
          if (room.doors.north) cell.classList.add('mapCellNoNorth');
          if (room.doors.south) cell.classList.add('mapCellNoSouth');
          if (room.doors.east)  cell.classList.add('mapCellNoEast');
          if (room.doors.west)  cell.classList.add('mapCellNoWest');
          cell.textContent = room.name;
        } else {
          cell.textContent = '?';
          cell.classList.add('mapCellNoNorth');
          cell.classList.add('mapCellNoSouth');
          cell.classList.add('mapCellNoEast');
          cell.classList.add('mapCellNoWest');
        }
  
        mapGrid.appendChild(cell);
      }
    }
  }
  
  
  

document.getElementById('mapToggle').addEventListener('click', () => {
  const container = document.getElementById('mapContainer');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
  renderMap();
});

document.getElementById('compass').addEventListener('click', () => {
  navigator.clipboard.writeText(seed.toString()).then(() => {
    console.log('Seed copied to clipboard:', seed);
  });
});

['north', 'south', 'east', 'west'].forEach(dir => {
  document.getElementById(dir).addEventListener('click', () => move(dir));
});

world.set(getKey(0, 0), { ...roomTemplates[0], id: 0, x: 0, y: 0, uid: '0-0-0' });
renderRoom();
