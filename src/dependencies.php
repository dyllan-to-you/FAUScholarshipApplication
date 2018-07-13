<?php
// DIC configuration

$container = $app->getContainer();

$container['authenticator'] = function($c) {
    return new \ScholarshipApi\Authenticator($c);
};

$container['session'] = function ($c) {
  return new \SlimSession\Helper;
};

// view renderer
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    $templateVars = [
        'baseUrl' => $c->get('settings')['baseUrl']
    ];
    return new Slim\Views\PhpRenderer($settings['template_path'], $templateVars);
};

// monolog
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Monolog\Logger($settings['name']);

    $file_handler = new \Monolog\Handler\StreamHandler($settings['path']);

    $formatter = new \Monolog\Formatter\LineFormatter("[%datetime%] %channel%.%level_name%: %message% %context% %extra%\r\n");    
    $file_handler->setFormatter($formatter);
    
    $logger->pushHandler($file_handler);
    return $logger;
};

// database
$container['db'] = function ($c) {
    try{
        $db = $c->get('settings')['db'];
        $pdo = new PDO('mysql:host=' . $db['host'] . ';dbname=' . $db['dbname'],
            $db['user'], $db['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (\PDOException $ex){
        $c->logger->addError($ex);
    }
};

// Application Dependencies
require_once('app_dependencies.php');
