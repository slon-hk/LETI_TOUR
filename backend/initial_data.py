INITIAL_DATA = [
    {
        "id": "hall_1_2_f1",
        "name": "Вход в Корпус 1/2",
        "corpus": "1_2",
        "floor": 1,
        "coordinates": [59.9712, 30.3205],
        "indoorPosition": {"x": 35.0, "y": 75.0},
        "overviewPosition": {"x": 70.0, "y": 40.0},
        "panorama": "/panoramas/my-room.jpg",
        "description": "Входная зона 1/2 корпуса. Поднимитесь на 2 этаж, чтобы перейти в 5 корпус.",
        "markers": [
            {
                "id": "nav-to-f2",
                "position": {"yaw": "0deg", "pitch": "20deg"},
                "image": "https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png",
                "size": {"width": 32, "height": 32},
                "anchor": "bottom center",
                "type": "nav",
                "target": "hall_1_2_f2",
                "tooltip": "Подняться на 2 этаж"
            }
        ]
    },
    {
        "id": "hall_1_2_f2",
        "name": "Холл Корпуса 1/2 (2 этаж)",
        "corpus": "1_2",
        "floor": 2,
        "coordinates": [59.9712, 30.3205],
        "indoorPosition": {"x": 35.0, "y": 35.0},
        "overviewPosition": None,
        "panorama": "https://photo-sphere-viewer-data.netlify.app/assets/sphere-test.jpg",
        "description": "2 этаж корпуса 1/2. Отсюда есть переход в 5 корпус.",
        "markers": [
            {
                "id": "nav-to-f1",
                "position": {"yaw": "180deg", "pitch": "-15deg"},
                "image": "https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png",
                "size": {"width": 32, "height": 32},
                "anchor": "bottom center",
                "type": "nav",
                "target": "hall_1_2_f1",
                "tooltip": "Спуститься на 1 этаж"
            }
        ]
    },
    {
        "id": "museum_entrance",
        "name": "Музей (Корпус 5)",
        "corpus": "5",
        "floor": 2,
        "coordinates": [59.9714, 30.3209],
        "indoorPosition": {"x": 55.0, "y": 60.0},
        "overviewPosition": {"x": 30.0, "y": 70.0},
        "panorama": "/panoramas/my-room.jpg",
        "description": "Добро пожаловать в мемориальный музей А.С. Попова.",
        "markers": [
            {
                "id": "info-door",
                "position": {"yaw": "-45deg", "pitch": "-10deg"},
                "image": "https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-red.png",
                "size": {"width": 32, "height": 32},
                "anchor": "bottom center",
                "type": "info",
                "title": "Старинная дверь",
                "text": "Эта дверь сохранилась с конца 19 века.",
                "audio": "/media/audio.mp3"
            }
        ]
    }
]