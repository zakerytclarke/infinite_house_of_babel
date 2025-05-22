// const seed = new Date().getTime();
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
const inventory = [];
const state = {};
let mapSize = 2;
const currentPosition = { x: 0, y: 0 };
let lastDirection = 'north';

function getKey(x, y) {
  return `${x},${y}`;
}


function specificConstraint(x, y, room) {
  //Infinite Hallway
  if (x == 0 && y < -10) {
    if (room.doors.north && room.doors.south && !room.doors.east && !room.doors.west && room.name == "Infinite Hall") {
      return true;
    } else {
      return false;
    }
  }
  if (x == 1 && y == -10 || x == 0 && y == -10 || x == -1 && y == -10) {
    if (room.doors.north && room.doors.south && !room.doors.west) {
      return true;
    } else {
      return false;
    }
  }
  if (x == 1 && y < -10) {
    if (!room.doors.west) {
      return true;
    } else {
      return false;
    }
  }
  if (x == -1 && y < -10) {
    if (!room.doors.east) {
      return true;
    } else {
      return false;
    }
  }

  //Any logic that cares about neighbors
  const neighbors = [
    { dx: 0, dy: -1, dir: 'north', opp: 'south' },
    { dx: 0, dy: 1, dir: 'south', opp: 'north' },
    { dx: 1, dy: 0, dir: 'east', opp: 'west' },
    { dx: -1, dy: 0, dir: 'west', opp: 'east' },
  ];

  let has_hedge_maze = false;

  for (const { dx, dy, dir, opp } of neighbors) {
    const neighbor = world.get(getKey(x + dx, y + dy));
    
    if (neighbor) {
      //Hedge Maze
      if(neighbor.name=="Hedge Maze" || neighbor.name=="Hedge Maze Entrance"){
        has_hedge_maze=true;
      }
    }
  }

  // If spawning a room adjacent to a hedge maze it better be a hedge maze
  if(has_hedge_maze&&room.name!="Hedge Maze"&&room.name!="Hedge Maze Entrance"){
    return false;
  }

  if(!has_hedge_maze&&(room.name=="Hedge Maze"||room.name=="Hedge Maze Entrance")){
    return false;
  }

  //Rooms that shouldn't spawn on their own:
  if (room.name == "Infinite Hall") {
    return false;
  }

  if (room.name == "Hedge Maze") {
    return false;
  }

  return true;
}



function getValidRooms(x, y, world, roomTemplates) {
  const key = getKey(x, y);

  return roomTemplates.slice(1).filter((room) => {
    // 1. No repeat of adjacent room types
    //TODO: re-enable later
    // for (const { dx, dy } of [
    //   { dx: 0, dy: -1 },
    //   { dx: 0, dy: 1 },
    //   { dx: 1, dy: 0 },
    //   { dx: -1, dy: 0 },
    // ]) {
    //   const neighbor = world.get(getKey(x + dx, y + dy));
    //   if (neighbor && neighbor.filename === room.filename) {
    //     return false;
    //   }
    // }

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


    // 4. Evaluate specific constraints
    if (specificConstraint(x, y, room) == false) {
      return false;
    }

    // 5. Prevent creatind dead-end paths for neighbors
    const blockingDirs = getBlockingDirectionsIfRoomPlaced(x, y, room, world);

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
    // const weight = baseWeight + numDoors * 2 + bias * 4;
    // const weight = baseWeight + numDoors * 0 + bias * 4;
    const weight = 1;
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
  console.log(validRooms);
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

function deepClonePreserveFunctions(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(deepClonePreserveFunctions);
  }

  const copy = {};
  for (const key in obj) {
    const val = obj[key];
    copy[key] =
      typeof val === 'object' && val !== null
        ? deepClonePreserveFunctions(val)
        : val;
  }
  return copy;
}

function generateRoom(x, y, fromDirection) {
  const key = getKey(x, y);
  const isSecondRoom = world.size === 1;

  const baseRoom = isSecondRoom
    ? { ...roomTemplates[1], id: 1 }
    : matchRoom(x, y);

  if (baseRoom) {
    const roomInstance = {
      ...deepClonePreserveFunctions(baseRoom),
      x,
      y,
      uid: `${baseRoom.id}-${x}-${y}`
    };

    if (random() < 0.25) {//Lock 5% of rooms
      baseRoom.locked = true;
    }


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
      let text = dir;
      let tempRoom = null;
      switch (dir) {
        case 'north': tempRoom = world.get(getKey(currentPosition.x, currentPosition.y - 1)); break;
        case 'south': tempRoom = world.get(getKey(currentPosition.x, currentPosition.y + 1)); break;
        case 'east': tempRoom = world.get(getKey(currentPosition.x + 1, currentPosition.y)); break;
        case 'west': tempRoom = world.get(getKey(currentPosition.x - 1, currentPosition.y)); break;
      }

      if (tempRoom && tempRoom.locked) {
        text += " 🔒";
      }
      document.getElementById(dir).style.display = room.doors[dir] ? 'block' : 'none';
      document.getElementById(dir).innerHTML = text;
    });
    img.style.visibility = 'visible';
    updateCompass();
    renderMap();
  };
  let filename = room.filename;
  if (typeof filename === 'function') {
    filename = filename(room, state);
  }
  img.src = `rooms/${filename}`;
  renderMap();
}

function move(dir) {
  lastDirection = dir;

  let tempRoom = null;
  // Get the room we are moving in to 
  let newX = currentPosition.x;
  let newY = currentPosition.y;

  switch (dir) {
    case 'north': newY -= 1; break;
    case 'south': newY += 1; break;
    case 'east': newX += 1; break;
    case 'west': newX -= 1; break;
  }

  tempRoom = world.get(getKey(newX, newY))

  if (!tempRoom) {
    const key = getKey(newX, newY);
    generateRoom(newX, newY, lastDirection);
    tempRoom = world.get(key);
  }

  if (tempRoom.locked) { // Room is locked, check if we have a key
    let hasKey = null;
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].name == "key") {
        inventory.splice(i, 1); // remove it from inventory
        tempRoom.locked = false;
        hasKey = true;
        break;
      }
    }
    if (!hasKey) {
      renderRoom();
      return;
    }

  }

  //Make the actual movement
  switch (dir) {
    case 'north': currentPosition.y -= 1; break;
    case 'south': currentPosition.y += 1; break;
    case 'east': currentPosition.x += 1; break;
    case 'west': currentPosition.x -= 1; break;
  }
  renderRoom();
}

function handleInventoryClick(index) {
  const item = inventory[index];
  const room = world.get(getKey(currentPosition.x, currentPosition.y));

  let result = null;

  if (room.interaction) {
    result = room.interaction(room, item);
    if (result) {
      // Remove the item from inventory if the interaction returns true
      inventory.splice(index, 1);
      
      
      renderRoom()
    }
  }
}

  

function renderMap() {
  let size = mapSize;
  const inventoryDiv = document.getElementById("inventory");
  inventoryDiv.innerHTML = "";
  inventoryDiv.innerHTML += inventory.map(function (obj, index) {
    let text = "";
    if (obj.name === "key") {
      text = "🔑";
    }
    if (obj.name === "top hat") {
      text = "🎩";
    }
    return `<span onclick="handleInventoryClick(${index})">${text}</span>`;
  }).join("");

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
        if (room.doors.east) cell.classList.add('mapCellNoEast');
        if (room.doors.west) cell.classList.add('mapCellNoWest');
        if (room.locked) {
          cell.textContent = "🔒";
        } else {
          cell.textContent = room.name;
        }

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
  if (mapSize == 0) {
    container.style.display = 'block';
    mapSize = 2;
  } else
    if (mapSize == 2) {
      container.style.display = 'block';
      mapSize = 5;
    }
    else if (mapSize == 5) {
      container.style.display = 'none';
      mapSize = 0;
    }
  // container.style.display = container.style.display === 'none' ? 'block' : 'none';
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

const roomImage = document.getElementById('roomImage');

// This should point to the current room object being rendered
let currentRoom = null; // Make sure you assign this when loading a room

roomImage.addEventListener('click', function (e) {
  const rect = roomImage.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width);
  const y = ((e.clientY - rect.top) / rect.height);

  handleRoomImageClick(x, y);
});

function handleRoomImageClick(xPercent, yPercent) {
  const x = currentPosition.x;
  const y = currentPosition.y;
  console.log(xPercent, yPercent);

  const currentRoom = world.get(getKey(x, y));
  if (!currentRoom || !currentRoom.objects) return;

  for (let i = 0; i < currentRoom.objects.length; i++) {
    const obj = currentRoom.objects[i];
    const { x, y, w, h } = obj.location;

    if (
      xPercent >= x &&
      xPercent <= x + w &&
      yPercent >= y &&
      yPercent <= y + h
    ) {
      result = obj;
      if (obj.fn && typeof obj.fn === 'function') {
        result = obj.fn(state);
      }
      if(result){
        inventory.push(result);
        currentRoom.objects.splice(i, 1); // Remove from room
      }
      
      console.log(inventory);

      renderRoom();
      break;
    }
  }
}