const roomTemplates = [
  
  {
    "name": "Entrance",
    "filename": "front.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Grand Hall",
    "filename": function (room) {
      console.log(room);
      if (room.objects.length > 0) {
        return 'hall.png';
      } else {
        return 'empty_hall.png'
      }
    },
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": true
    },
    "objects": [
      {
        "name": "key",
        "location": {
          "x": 0.1,
          "y": 0.45,
          "w": 0.15,
          "h": 0.15
        }
      }
    ],
    "requirement":function(x, y, ){

    }
  },
  {
    "name": "Chandelier",
    "filename": "Elegant Isometric Room with Chandelier.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": false
    },
    "flipped": true
  },
  {
    "name": "Observatory",
    "filename": "Astronomy Observatory in Pixel Art.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Bathroom",
    "filename": "bathroom.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Boiler Room",
    "filename": "Boiler Room in Pixel Art.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Furnace",
    "filename": "furnace.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    },
    "locked": true
  },
  {
    "name": "Bedroom",
    "filename": "Children's Bedroom with Toys.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Clock Room",
    "filename": "Clock Showcase in Warm Tones.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Coat Closet",
    "filename": "Cozy Coat Closet in PixelArt.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Bedroom",
    "filename": "Cozy Pixel Bedroom with Vintage Flair.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Art Hall",
    "filename": "Cozy Room with Framed Landscapes.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Lever Room",
    "filename": "Digital Control Room in Pixel Art.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Model House",
    "filename": "Dollhouse Room with Wooden Table.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Chairs",
    "filename": "Elegant Chairs by Open Doorway.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Empty Room",
    "filename": "Empty Retro Room with Dark Doorway.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Empty Room",
    "filename": "Empty Retro Room with Dark Doorway.png",
    "doors": {
      "north": false,
      "south": false,
      "east": true,
      "west": true
    },
    "flipped": true
  },
  {
    "name": "Empty Room",
    "filename": "Empty Room with Herringbone Floor.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Office",
    "filename": "Isometric Office with Fax and Cooler.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Dining Room",
    "filename": "Isometric Pixel Art Dining Room.png",
    "doors": {
      "north": false,
      "south": true,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Aquarium",
    "filename": "Isometric Room with Aquariums.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Red Carpet",
    "filename": "Isometric Room with Red Carpet.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "You are being Watched",
    "filename": "Isometric Room with Security Cameras.png",
    "doors": {
      "north": false,
      "south": false,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Bathroom",
    "filename": "Pixel Art Bathroom Setup.png",
    "doors": {
      "north": false,
      "south": false,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Cathedral",
    "filename": "Pixel Art Church Interior.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Library",
    "filename": "Pixel Art Cozy Library Interior.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Library",
    "filename": "Pixel Art Cozy Library Scene.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Benches",
    "filename": "Pixel Art Cozy Room with Benches.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Benches",
    "filename": "Pixel Art Cozy Room with Benches.png",
    "doors": {
      "north": false,
      "south": false,
      "east": true,
      "west": true
    },
    "flipped": true
  },
  {
    "name": "Crown Room",
    "filename": "Pixel Art Crown on Pedestal.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Mirror Room",
    "filename": "Pixel Art Empty Room with Mirrors.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Gallery",
    "filename": "Pixel Art Gallery with Statues and Paintings.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    },
    "locked": true
  },
  {
    "name": "Gym",
    "filename": "Pixel Art Gym Room Overview.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Gym",
    "filename": "Pixel Art Gym Workout Room.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Laboratory",
    "filename": "Pixel Art Laboratory with Glassware.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Mirror Room",
    "filename": "Pixel Art Room Corner with Mirror.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Aquarium",
    "filename": "Pixel Art Room with Aquarium.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Workshop",
    "filename": "Pixel Art Workshop Scene.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Nursery",
    "filename": "Pixel Nursery with Celestial Mobile.png",
    "doors": {
      "north": false,
      "south": false,
      "east": false,
      "west": true
    },
    "flipped": true
  },
  {
    "name": "Plumbing",
    "filename": "Pipes and Valves in a Basement.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "The Pub",
    "filename": "Pub Corner in Pixel Art.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Indoor Garden",
    "filename": "Retro Indoor Garden in Pixel Art.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Office",
    "filename": "Retro Office in Pixel Art.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Living Room",
    "filename": "Retro Pixel Art Living Room.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Bedroom",
    "filename": "Retro Pixel Bedroom with Bunk Bed.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Kitchen",
    "filename": "Retro Pixel Kitchen Interior.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Study",
    "filename": "Retro Room with Aquarium and Desk.png",
    "doors": {
      "north": false,
      "south": false,
      "east": false,
      "west": true
    },
    "flipped": true
  },
  {
    "name": "Throne Room",
    "filename": "Royal Throne Room in Pixels.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": true
    }
  },
  {
    "name": "Security Room",
    "filename": "Security Monitoring Room in Pixel Art.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Sunroom",
    "filename": "Sunroom with Lush Greenery.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Benches",
    "filename": "Symmetrical Room with Ornate Benches.png",
    "doors": {
      "north": false,
      "south": false,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Bathroom",
    "filename": "bathroom.png",
    "doors": {
      "north": true,
      "south": false,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Closet",
    "filename": "closet.png",
    "doors": {
      "north": false,
      "south": false,
      "east": false,
      "west": true
    },
    "flipped": true
  },
  {
    "name": "Kitchen",
    "filename": "kitchen.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Infinite Hall",
    "filename": "infinite_hall.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {// Need 2 so we can sample
    "name": "Infinite Hall",
    "filename": "infinite_hall_torch.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Hedge Maze Entrance",
    "filename": "hedge_maze_right.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_right.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_left.png",
    "doors": {
      "north": false,
      "south": false,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_right.png",
    "doors": {
      "north": true,
      "south": false,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_left.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_left.png",
    "doors": {
      "north": false,
      "south": true,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_right.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": false
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_both.png",
    "doors": {
      "north": true,
      "south": true,
      "east": true,
      "west": true
    }
  },
  {
    "name": "Hedge Maze",
    "filename": "hedge_maze_right.png",
    "doors": {
      "north": true,
      "south": true,
      "east": false,
      "west": false
    }
  },
];