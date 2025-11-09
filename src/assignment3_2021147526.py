import psycopg
from psycopg import sql
import os
from typing import Union


# problem 1
def entire_search(CONNECTION: str, table_name: str) -> list:

    records = []

    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cur:
            
            query = sql.SQL("SELECT * FROM myschema.{}").format(
                sql.Identifier(table_name)
            )
            
            cur.execute(query)
            records = cur.fetchall()

    return records


# problem 2
def registration_history(CONNECTION: str, student_id: str) -> Union[list, None]:

    records = []
    
    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cur:
            
            check_query = 'SELECT "NAME" FROM myschema.students WHERE "STUDENT_ID" = %s'
            cur.execute(check_query, (student_id, ))
            
            student_exists = cur.fetchone()
            
            if student_exists is None:
                print(f"Not Exist student with STUDENT ID: {student_id}")
                return None

            main_query = """
                SELECT 
                    C."YEAR", C."SEMESTER", C."COURSE_ID_PREFIX", 
                    C."COURSE_ID_NO", C."DIVISION_NO", C."COURSE_NAME", 
                    F."NAME", G."GRADE"
                FROM 
                    myschema.course_registration AS R
                JOIN 
                    myschema.course AS C ON R."COURSE_ID" = C."COURSE_ID"
                JOIN 
                    myschema.faculty AS F ON C."PROF_ID" = F."ID"
                LEFT JOIN 
                    myschema.grade AS G ON R."COURSE_ID" = G."COURSE_ID" AND R."STUDENT_ID" = G."STUDENT_ID"
                WHERE 
                    R."STUDENT_ID" = %s
                ORDER BY 
                    C."YEAR" ASC, C."SEMESTER" ASC, C."COURSE_NAME" ASC
            """
            
            cur.execute(main_query, (student_id, ))
            records = cur.fetchall()

    return records


# problem 3
def registration(CONNECTION: str, course_id: int, student_id: str) -> Union[list, None]:

    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cur:

            cur.execute('SELECT "COURSE_NAME" FROM myschema.course WHERE "COURSE_ID" = %s', (course_id,))
            course_row = cur.fetchone()
            if course_row is None:
                print(f"Not Exist course with COURSE ID: {course_id}")
                return None
            course_name = course_row[0]

            cur.execute('SELECT "NAME" FROM myschema.students WHERE "STUDENT_ID" = %s', (student_id,))
            student_row = cur.fetchone()
            if student_row is None:
                print(f"Not Exist student with STUDENT ID: {student_id}")
                return None
            student_name = student_row[0]

            cur.execute('SELECT * FROM myschema.course_registration WHERE "COURSE_ID" = %s AND "STUDENT_ID" = %s', (course_id, student_id))
            if cur.fetchone() is not None:
                print(f"{student_name} is already registrated in {course_name}")
                return None
            
            insert_query = 'INSERT INTO myschema.course_registration ("COURSE_ID", "STUDENT_ID") VALUES (%s, %s)'
            cur.execute(insert_query, (course_id, student_id))
            
            conn.commit()
            
            history_query = """
                SELECT C."YEAR", C."SEMESTER", C."COURSE_ID_PREFIX", C."COURSE_ID_NO", C."DIVISION_NO", C."COURSE_NAME", F."NAME", G."GRADE"
                FROM myschema.course_registration AS R
                JOIN myschema.course AS C ON R."COURSE_ID" = C."COURSE_ID"
                JOIN myschema.faculty AS F ON C."PROF_ID" = F."ID"
                LEFT JOIN myschema.grade AS G ON R."COURSE_ID" = G."COURSE_ID" AND R."STUDENT_ID" = G."STUDENT_ID"
                WHERE R."STUDENT_ID" = %s
                ORDER BY C."YEAR" ASC, C."SEMESTER" ASC, C."COURSE_NAME" ASC
            """
            cur.execute(history_query, (student_id,))
            records = cur.fetchall()
            return records


# problem 4
def withdrawal_registration(CONNECTION: str, course_id: int, student_id: str) -> Union[list, None]:

    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cur:

            cur.execute('SELECT "COURSE_NAME" FROM myschema.course WHERE "COURSE_ID" = %s', (course_id,))
            course_row = cur.fetchone()
            if course_row is None:
                print(f"Not Exist course with COURSE ID: {course_id}")
                return None
            course_name = course_row[0]

            cur.execute('SELECT "NAME" FROM myschema.students WHERE "STUDENT_ID" = %s', (student_id,))
            student_row = cur.fetchone()
            if student_row is None:
                print(f"Not Exist student with STUDENT ID: {student_id}")
                return None
            student_name = student_row[0]

            cur.execute('SELECT * FROM myschema.course_registration WHERE "COURSE_ID" = %s AND "STUDENT_ID" = %s', (course_id, student_id))
            if cur.fetchone() is None:
                print(f"{student_name} is not registrated in {course_name}")
                return None
            
            delete_query = 'DELETE FROM myschema.course_registration WHERE "COURSE_ID" = %s AND "STUDENT_ID" = %s'
            cur.execute(delete_query, (course_id, student_id))
            
            conn.commit()
            
            history_query = """
                SELECT C."YEAR", C."SEMESTER", C."COURSE_ID_PREFIX", C."COURSE_ID_NO", C."DIVISION_NO", C."COURSE_NAME", F."NAME", G."GRADE"
                FROM myschema.course_registration AS R
                JOIN myschema.course AS C ON R."COURSE_ID" = C."COURSE_ID"
                JOIN myschema.faculty AS F ON C."PROF_ID" = F."ID"
                LEFT JOIN myschema.grade AS G ON R."COURSE_ID" = G."COURSE_ID" AND R."STUDENT_ID" = G."STUDENT_ID"
                WHERE R."STUDENT_ID" = %s
                ORDER BY C."YEAR" ASC, C."SEMESTER" ASC, C."COURSE_NAME" ASC
            """
            cur.execute(history_query, (student_id,))
            records = cur.fetchall()
            return records


# problem 5
def modify_lectureroom(CONNECTION: str, course_id: int, buildno: str, roomno: str) -> Union[list, None]:
    
    with psycopg.connect(CONNECTION) as conn:
        with conn.cursor() as cur:

            cur.execute('SELECT * FROM myschema.course WHERE "COURSE_ID" = %s', (course_id,))
            if cur.fetchone() is None:
                print(f"Not Exist course with COURSE ID: {course_id}")
                return None

            cur.execute('SELECT * FROM myschema.lectureroom WHERE "BUILDNO" = %s AND "ROOMNO" = %s', (buildno, roomno))
            if cur.fetchone() is None:
                print(f"Not Exist lecture room with BUILD NO: {buildno} / ROOM NO: {roomno}")
                return None
            
            update_query = 'UPDATE myschema.course SET "BUILDNO" = %s, "ROOMNO" = %s WHERE "COURSE_ID" = %s'
            cur.execute(update_query, (buildno, roomno, course_id))
            
            conn.commit()
            
            check_query = """
                SELECT "COURSE_ID", "YEAR", "SEMESTER", "COURSE_NAME", "BUILDNO", "ROOMNO"
                FROM myschema.course
                WHERE "COURSE_ID" = %s
            """
            cur.execute(check_query, (course_id,))
            records = cur.fetchall()
            return records


# sql file execute ( Not Edit )
def execute_sql(CONNECTION, path):
    folder_path = '/'.join(path.split('/')[:-1])
    file = path.split('/')[-1]
    if file in os.listdir(folder_path):
        with psycopg.connect(CONNECTION) as conn:
            conn.execute(open(path, 'r', encoding='utf-8').read())
            conn.commit()
        print("{} EXECUTRED!".format(file))
    else:
        print("{} File Not Exist in {}".format(file, folder_path))
