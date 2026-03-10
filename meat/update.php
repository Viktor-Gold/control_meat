<?php
// update.php

// Пути к файлам
$dataFile = __DIR__ . '/data.json';

// Читаем тело запроса
$input = file_get_contents('php://input');

// Проверяем, что пришел JSON
if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Нет данных для сохранения']);
    exit;
}

// Декодируем JSON
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректный JSON']);
    exit;
}

// Сохраняем в файл
if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success', 'message' => 'Данные сохранены']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения файла']);
}