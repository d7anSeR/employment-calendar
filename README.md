# Календарь занятости сотрудников 📅
**Концепция продукта:**

Продукт представляет собой интуитивно понятный и функциональный календарь занятости сотрудников, который интегрируется с системой учета рабочего времени, разработанной на базе 1С и размещенной на веб-сервере. Календарь поможет эффективно управлять рабочим временем и загрузкой сотрудников, обеспечивая прозрачность и удобство в планировании задач.

**Название команды:**
Дамский квартет +1

**Группа:** 6512-100503D

## Блок работы с API
Все действия могут производить только авторизованные сотрудники.
### API для задачи
Сотрудник вычитывается из headers, он может изменить или удалить только те задачи, что принадлежат ему по таблице schedule_entry.

Задачи на сервер может добавлять любой авторизованный сотрудник.

**ПУНКТЫ НИЖЕ ПРО ПОЛУЧЕНИЕ ИНФОРМАЦИИ ПО ЗАДАЧАМ НАДО БУДЕТ ПОПРАВИТЬ (!!!!)**

Получать задачи по сотруднику - может любой авторизованный сотрудник.

Получать задачи по дате - может любой авторизованный сотрудник.

Получать задачи по дате и сотруднику - может любой авторизованный сотрудник.

Получение всех задач - авторизованный сотрудник получает абсолютно все свои задачи и только общедоступные чужие.
***
1. **Добавление заявки на сервер _POST_ /api/webhook/schedule**
```
{
  "id": 3221,
  "viewTask": "личная"
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
2. **Получение задач по сотруднику _GET_ /api/webhook/employee/{employeeId}**

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
3. **Получение задач по дате _GET_ /api/webhook/date/2025-09-28**

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
4. **Получение задач по сотруднику и дате _GET_ /api/webhook/employee/{employeeId}/date/{date}**

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
5. **Изменение задачи _PATCH_ /api/webhook/schedule/task/{taskId}**
```
{
  "status": 3
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
6. **Удаление задачи _DELETE_ /api/webhook/schedule/task/{taskId}**
```
{
  "status": 3
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
7. **Получение всех своих задач и общедоступных чужих _GET_ /api/webhook/schedule/tasks**

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
### API для работы с сотрудниками
Добавлять, изменять и удалять сотрудников из системы может только сотрудник с ролью "ADMIN".

Получать всех сотрудников может любой авторизованный сотрудник.

Поиск сотрудника осуществляется по почте, соответственно на сервере у всех сотрудников разные почты.

Чтобы авторизоваться - не надо указывать headers.
***
1. **Получение всех юзеров _GET_ /api/webhook/employees**
**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
2. **Добавление сотрудника _POST_ /api/webhook/employee/create**
```
{
  "id": 23423,
  "name": "Егор",
  "email": "exam@example.com",
  "password": "fggdf",
  "role" : "user"
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***

3. **Обновление данных сотрудника _PATCH_ /api/webhook/employee/update**
```
{
  "name": "Дима",
  "email": "exam@example.com"
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***
4. **Аутентификация сотрудника на входе _POST_ /api/webhook/employee/auth**
```
{
  "email": "admin@mail.com",
  "password": "123456"
}
```

5. **Удаление сотрудника из базы _DELETE_ /api/webhook/employee/delete**
```
{
  "email": "jhgv@example.com"
}
```

**Headers**

|Key| Value |
|-----|-|
|Authorization|Basic ZXhhbUBleGFtcGxlLmNvbTpmZ2dkZg==|
***

## Таблица задач
```
CREATE TABLE schedule_entry (
    id              bigint ,
    task_name        TEXT NULL,
    task_description TEXT null,
    start_date       TIMESTAMP null,
    end_date         TIMESTAMP null,
    status           INT null,
    priority         INT null,
    counterparty     TEXT null,
    employee_id      BIGINT null,
    view_task        text null
);
drop table schedule_entry
select * from schedule_entry
```

## Таблица сотрудников
```
CREATE TABLE employee (
    id     bigint ,
    name  TEXT NULL,
    email TEXT null,
    password TEXT null,
    role text null
);
drop table employee
select * from  employee

INSERT INTO employee (id, name, email, password, role)
VALUES (3232, 'admin', 'admin@mail.com',
'$2a$10$AqcNZnC4cM6FJ5OECGf3TeGsjZYAabtQqAuvj4fxpvUB.4hgYzFWm', 'ADMIN');
```