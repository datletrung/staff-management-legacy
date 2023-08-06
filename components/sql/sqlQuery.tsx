export const sqlQuery = {
    //-----AUTH
    'fetchRole': `
        SELECT
            USER_ID
            ,EMAIL
            ,ROLE
            ,CONCAT(FIRST_NAME, ' ', LAST_NAME) AS NAME
        FROM USER
        WHERE 1=1
        AND (EMAIL = ? OR USER_ID = ?)
        AND PASSWORD = ?
        AND ACTIVE_FLAG = 'Y'
        AND LOCKED_FLAG = 'N'
    `,
    //-----STAFF ZONE > ABSENCE
    'fetchAbsenceTable': `
        SELECT
            ABSENCE_ID
            ,ABSENCE_START
            ,ABSENCE_END
            ,TOTAL_DAY
            ,(SELECT MEANING FROM LOOKUPS WHERE LOOKUP_TYPE = 'APPROVAL_STATUS' AND LOOKUP_CODE = APPROVAL_STATUS) AS APPROVAL_STATUS
        FROM ABSENCE
        WHERE 1=1
            AND USER_ID = ?
        ORDER BY ABSENCE_START DESC
                ,ABSENCE_END DESC
    `,
    'fetchAbsenceCalendar': `
        SELECT DISTINCT
            DATE_FORMAT(DATE_ADD(ABSENCE_START, INTERVAL t DAY), '%m/%d/%Y') AS ABSENCE_DAY
            ,APPROVAL_STATUS
        FROM (
            SELECT t
            FROM (
                SELECT (t1.i + t2.i * 10) AS t
                FROM (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t1
                CROSS JOIN (SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t2
            ) AS numbers
            WHERE
                t <= (SELECT MAX(TOTAL_DAY) FROM ABSENCE)
        ) t3
        INNER JOIN ABSENCE
            ON DATE_ADD(ABSENCE_START, INTERVAL t DAY) BETWEEN ABSENCE_START AND ABSENCE_END
            AND MONTH(STR_TO_DATE(?, '%m/%Y')) BETWEEN MONTH(ABSENCE_START) AND MONTH(ABSENCE_END)
        WHERE USER_ID = ?
        ORDER BY CREATED_AT DESC
    `,
    'checkAbsenceExist':`
        SELECT 1
        FROM (
            SELECT
                STR_TO_DATE(?, '%m/%d/%Y') AS AB_START
                ,STR_TO_DATE(?, '%m/%d/%Y') AS AB_END
            ) t
            ,ABSENCE
        WHERE 1=1
            AND USER_ID = ?
            AND APPROVAL_STATUS = 'APPROVED'
            AND (AB_START <= ABSENCE_END AND AB_END >= ABSENCE_START)
    `,
    'requestAbsence': `
        INSERT INTO ABSENCE (USER_ID, ABSENCE_START, ABSENCE_END, APPROVAL_STATUS, CREATED_AT)
        VALUES (?, STR_TO_DATE(?, '%m/%d/%Y'), STR_TO_DATE(?, '%m/%d/%Y'), 'PENDING', NOW())
    `,
    'deleteAbsence': `
        DELETE FROM ABSENCE
        WHERE 1=1
            AND USER_ID = ?
            AND ABSENCE_ID = ?
    `,
    //-----STAFF ZONE > TIME ENTRY
    'fetchTimeEntryDay': `
        SELECT
            USER_ID
            ,TIME_IN
            ,TIME_OUT
            ,ROUND(TIME_TO_SEC(CASE WHEN TOTAL_TIME IS NOT NULL
                THEN TOTAL_TIME
                ELSE TIMEDIFF(NOW(), TIME_IN)
                END) / 3600, 2) AS TOTAL_TIME
        FROM (
            SELECT DISTINCT T2.*
            FROM (
                    SELECT
                        TIMECLOCK_ID
                        ,USER_ID
                        ,TIME_IN AS TIME_ALL
                    FROM TIMECLOCK
                    UNION ALL
                    SELECT
                        TIMECLOCK_ID
                        ,USER_ID
                        ,TIME_OUT AS TIME_ALL
                    FROM TIMECLOCK
                ) T1
            LEFT JOIN TIMECLOCK T2
                ON T1.TIMECLOCK_ID = T2.TIMECLOCK_ID
            WHERE 1=1
                AND T1.USER_ID = ?
                AND DATE_FORMAT(T1.TIME_ALL, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
        ) T
        ORDER BY TIME_IN
    `,
    'fetchTimeEntryMonth': `
        SELECT
            DISTINCT DATE_FORMAT(T.TIME_ALL, '%m/%d/%Y') AS DATE
        FROM 
            (
                SELECT
                    USER_ID
                    ,TIME_IN AS TIME_ALL
                FROM TIMECLOCK
                UNION ALL
                SELECT
                    USER_ID
                    ,TIME_OUT AS TIME_ALL
                FROM TIMECLOCK
            ) T
        WHERE 1=1
            AND T.USER_ID = ?
            AND DATE_FORMAT(T.TIME_ALL, '%Y-%m') = DATE_FORMAT(STR_TO_DATE(?, '%m/%Y'), '%Y-%m')
    `,
    'fetchTotalTimePerWeek':`
        SELECT SUM(TOTAL_TIME) AS TOTAL_TIME
        FROM (
            SELECT
                USER_ID
                ,ROUND(TIME_TO_SEC(CASE WHEN TOTAL_TIME IS NOT NULL
                                    THEN TOTAL_TIME
                                    ELSE TIMEDIFF(NOW(), TIME_IN)
                                    END) / 3600, 2) AS TOTAL_TIME
            FROM TIMECLOCK
            ,(SELECT
                DATE(DATE_SUB(STR_TO_DATE(?, '%m/%d/%Y'), INTERVAL (DAYOFWEEK(STR_TO_DATE(?, '%m/%d/%Y')) - 1) DAY)) AS START_WEEK
                ,DATE(DATE_ADD(STR_TO_DATE(?, '%m/%d/%Y'), INTERVAL 7-((DAYOFWEEK(STR_TO_DATE(?, '%m/%d/%Y')))) DAY)) AS END_WEEK
            ) T1
            WHERE 1=1
                AND (DATE(TIME_IN) BETWEEN T1.START_WEEK AND T1.END_WEEK
                    OR DATE(TIME_OUT) BETWEEN T1.START_WEEK AND T1.END_WEEK
                )
                AND USER_ID = ?
        ) T
        GROUP BY USER_ID
    `,
    'fetchTotalTimeCustom':`
        SELECT SUM(TOTAL_TIME) AS TOTAL_TIME
        FROM (
            SELECT
                USER_ID
                ,ROUND(TIME_TO_SEC(CASE WHEN TOTAL_TIME IS NOT NULL
                                    THEN TOTAL_TIME
                                    ELSE TIMEDIFF(NOW(), TIME_IN)
                                    END) / 3600, 2) AS TOTAL_TIME
            FROM TIMECLOCK
            ,(SELECT
                DATE(STR_TO_DATE(?, '%m/%d/%Y')) AS START_DAY
                ,DATE(STR_TO_DATE(?, '%m/%d/%Y')) AS END_DAY
            ) T1
            WHERE 1=1
                AND (DATE(TIME_IN) BETWEEN T1.START_DAY AND T1.END_DAY
                    OR DATE(TIME_OUT) BETWEEN T1.START_DAY AND T1.END_DAY
                )
                AND USER_ID = ?
        ) T
        GROUP BY USER_ID
    `,
    'submitTimeEntry': `
        CALL SUBMIT_TIMECLOCK(?)
    `,
    //-----MANAGER ZONE > MANAGE ABSENCE
    'updateApprovalStatusAbsence':`
        UPDATE ABSENCE
        SET APPROVAL_STATUS = ?
            ,STATUS_CHANGE_AT = NOW()
            ,APPROVER = ?
        WHERE 1=1
            AND USER_ID = ?
            AND APPROVAL_STATUS = 'PENDING'
    `,
    'approveAbsence': `
        UPDATE ABSENCE
        SET
            APPROVAL_STATUS = 'APPROVED'
            ,STATUS_CHANGE_AT = NOW()
            ,APPROVER = ?
        WHERE 1=1
            AND USER_ID = ?
            AND ABSENCE_ID = ?
            AND APPROVAL_STATUS = 'PENDING'
    `,
    'rejectAbsence': `
        UPDATE ABSENCE
        SET
            APPROVAL_STATUS = 'REJECTED'
            ,STATUS_CHANGE_AT = NOW()
            ,APPROVER = ?
        WHERE 1=1
            AND USER_ID = ?
            AND ABSENCE_ID = ?
            AND APPROVAL_STATUS = 'PENDING'
    `,
    //-----MANAGER ZONE > SETTINGS
    'fetchSettings':`
        SELECT SETTING_NAME, SETTING_VALUE
        FROM APP_SETTING
        WHERE ENABLED_FLAG = 'Y'
    `,
    'updateSettings':`
        UPDATE APP_SETTING
        JOIN (
            SELECT ? AS NEW_VALUE, 'COMPANY_NAME' AS SETTING_NAME
            UNION ALL
            SELECT ?, 'COMPANY_SHORT_NAME'
            UNION ALL
            SELECT ?, 'AUTO_APPROVE'
            UNION ALL
            SELECT ?, 'PROVINCE'
            UNION ALL
            SELECT ?, 'PAY_PERIOD'
            UNION ALL
            SELECT ?, 'OVERTIME_HOUR_DAY'
            UNION ALL
            SELECT ?, 'OVERTIME_HOUR_WEEK'
        ) NEW_SETTING
        ON APP_SETTING.SETTING_NAME = NEW_SETTING.SETTING_NAME
        SET APP_SETTING.SETTING_VALUE = NEW_SETTING.NEW_VALUE,
            APP_SETTING.LAST_UPDATED_AT = NOW(),
            APP_SETTING.LAST_UPDATED_BY = ?
        WHERE APP_SETTING.SETTING_VALUE != NEW_SETTING.NEW_VALUE
    `,
    //-----MANAGER ZONE > TIME SHEET
    'approveTimeSheet': `
        UPDATE TIMECLOCK
        SET APPROVED = 'Y', APPROVED_BY = ?
        WHERE 1=1
            AND USER_ID = ?
            AND (DATE_FORMAT(TIME_IN, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
                OR DATE_FORMAT(TIME_OUT, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
            )
            AND TIME_OUT IS NOT NULL
            AND 'N' = (SELECT SETTING_VALUE FROM APP_SETTING WHERE SETTING_NAME = 'AUTO_APPROVE' AND MODULE = 'TIME_ENTRY')
    `,
    'approveTimeSheetAll': `
        UPDATE TIMECLOCK
        SET APPROVED = 'Y', APPROVED_BY = ?
        WHERE 1=1
            AND USER_ID = ?
            AND TIME_OUT IS NOT NULL
            AND 'N' = (SELECT SETTING_VALUE FROM APP_SETTING WHERE SETTING_NAME = 'AUTO_APPROVE' AND MODULE = 'TIME_ENTRY')
    `,
    'fetchTotalTimePerDay':`
        SELECT
            USER_ID
            ,DATE(TIME_IN) AS EVENT_DATE
            ,ROUND(TIME_TO_SEC(CASE WHEN TOTAL_TIME IS NOT NULL
                                THEN TOTAL_TIME
                                ELSE TIMEDIFF(NOW(), TIME_IN)
                                END) / 3600, 2) AS TOTAL_TIME
        FROM TIMECLOCK
        ,(SELECT
            DATE(STR_TO_DATE(?, '%m/%d/%Y')) AS START_DAY
            ,DATE(STR_TO_DATE(?, '%m/%d/%Y')) AS END_DAY
        ) T1
        WHERE 1=1
            AND (DATE(TIME_IN) BETWEEN T1.START_DAY AND T1.END_DAY
                OR DATE(TIME_OUT) BETWEEN T1.START_DAY AND T1.END_DAY
            )
            AND USER_ID = ?
    `,
    //-----MANAGER ZONE > MANAGE STAFF
    'fetchEmployeeList':`
        SELECT USER_ID, FIRST_NAME, LAST_NAME, CONCAT(FIRST_NAME, ' ', LAST_NAME) AS FULL_NAME, EMAIL, PHONE_NUMBER
        FROM USER
        WHERE 1=1
            AND ACTIVE_FLAG = 'Y'
    `,
    'checkAddEmployee':`
            SELECT USER_ID, ACTIVE_FLAG, LOCKED_FLAG
            FROM USER
            WHERE EMAIL = ?
    `,
    'submitAddEmployee': `
        INSERT INTO USER (FIRST_NAME, LAST_NAME, PASSWORD, EMAIL, LAST_UPDATED_BY, CREATED_BY)
        SELECT ?, ?, ?, ?, USER.USER_ID, USER.USER_ID
        FROM USER
        WHERE 1=1
            AND USER_ID = ?
            AND ACTIVE_FLAG = 'Y'
    `,
    'submitRehireEmployee': `
        UPDATE USER AS USR
        SET USR.FIRST_NAME = ?
            ,USR.LAST_NAME = ?
            ,USR.PASSWORD = ?
            ,USR.ROLE = 'EMPLOYEE'
            ,USR.ACTIVE_FLAG = 'Y'
            ,USR.LOCKED_FLAG = 'N'
            ,USR.LAST_UPDATED_AT = NOW()
            ,USR.LAST_UPDATED_BY = ?
        WHERE USR.USER_ID = ?
    `,
    'fetchEmployeeOption':`
        SELECT ROLE, LOCKED_FLAG
        FROM USER
        WHERE 1=1
            AND USER_ID = ?
            AND ACTIVE_FLAG = 'Y'
    `,
    'setEmployeeOption':`
        UPDATE USER AS USR
        SET USR.ROLE = ?
            ,USR.ACTIVE_FLAG = ?
            ,USR.LOCKED_FLAG = ?
            ,USR.LAST_UPDATED_AT = NOW()
            ,USR.LAST_UPDATED_BY = ?
        WHERE USR.USER_ID = ?
    `,
    'resetPassword':`
        UPDATE USER
        SET PASSWORD = ?
        WHERE 1=1
        AND USER_ID = ?
    `,
    //-----MANAGER ZONE > PAYROLL
    'savePayroll':`
        INSERT INTO PAYROLL (USER_ID, PAY_PERIOD_FROM, PAY_PERIOD_TO, PAY_DATE, PAY_PERIOD, PAY_PROVINCE, TOTAL_HOUR, HOURLY_RATE, WAGES, VACATION_PAY, TAX_FED, TAX_PROV, CPP, EI, CREATED_AT, CREATED_BY)
        VALUES (?, STR_TO_DATE(?, '%m/%d/%Y'), STR_TO_DATE(?, '%m/%d/%Y'), STR_TO_DATE(?, '%m/%d/%Y'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `,
    'fetchPayrollList':`
        SELECT PAYROLL_ID, PAY_PERIOD_FROM, PAY_PERIOD_TO, TOTAL_NET_PAY
        FROM PAYROLL
        WHERE USER_ID = ?
    `,
    'fetchPayrollDetail':`
        SELECT PAYROLL_ID, PAY_PERIOD_FROM, PAY_PERIOD_TO, PAY_DATE, PAY_PERIOD, PAY_PROVINCE, TOTAL_HOUR, HOURLY_RATE, WAGES, VACATION_PAY, TAX_FED, TAX_PROV, CPP, EI, TOTAL_EARNINGS, TOTAL_DEDUCTION, TOTAL_NET_PAY
        FROM PAYROLL
        WHERE 1=1
            AND USER_ID = ?
            AND PAYROLL_ID = ?
    `,
    'deletePayroll':`
        DELETE FROM PAYROLL
        WHERE 1=1
            AND USER_ID = ?
            AND PAYROLL_ID = ?
    `,
    //-----PROFILE
    'fetchPersonalInfo':`
        SELECT
            EMAIL
            ,PHONE_NUMBER
            ,FIRST_NAME
            ,LAST_NAME
        FROM USER
        WHERE USER_ID = ?
    `,
    'updatePersonalInfo':`
        UPDATE USER
        SET EMAIL = ?
        ,PHONE_NUMBER = ?
        ,FIRST_NAME = ?
        ,LAST_NAME = ?
        ,LAST_UPDATED_AT = NOW()
        ,LAST_UPDATED_BY = ?
        WHERE USER_ID = ?
    `,
    'updatePassword':`
        UPDATE USER
        SET PASSWORD = ?
        WHERE 1=1
        AND USER_ID = ?
        AND PASSWORD = ?
    `,
    //-----PROFILE
    'fetchTotalHourPerWeek':`
        SELECT
            FULL_NAME AS ID
            ,TOTAL_HOUR AS X_AXIS
            ,WEEK_NUMBER AS Y_AXIS
        FROM (   
            SELECT
                (SELECT CONCAT(FIRST_NAME, ' ', LAST_NAME) FROM USER WHERE USER_ID = TC.USER_ID) AS FULL_NAME
                ,WEEK(TC.TIME_IN) AS WEEK_NUMBER
                ,ROUND(SUM(TIME_TO_SEC(TIME(TC.TOTAL_TIME)) / 3600), 2) AS TOTAL_HOUR
            FROM TIMECLOCK TC
            GROUP BY TC.USER_ID, WEEK_NUMBER
            ORDER BY TC.USER_ID, WEEK_NUMBER
        ) t
    `,
    'fetchAttendancePerWeek':`
        SELECT
            FULL_NAME AS ID
            ,ATTENDANCE_COUNT AS X_AXIS
            ,WEEK_NUMBER AS Y_AXIS
        FROM (   
            SELECT
                (SELECT CONCAT(FIRST_NAME, ' ', LAST_NAME) FROM USER WHERE USER_ID = TC.USER_ID) AS FULL_NAME
                ,WEEK(TC.TIME_IN) AS WEEK_NUMBER
                ,COUNT(DISTINCT DATE(TIME_IN)) AS ATTENDANCE_COUNT
            FROM TIMECLOCK TC
            GROUP BY TC.USER_ID, WEEK_NUMBER
            ORDER BY TC.USER_ID, WEEK_NUMBER
        ) t
    `,
    'fetchAvgHourPerDay':`
        SELECT
            FULL_NAME AS ID
            ,AVG_WORKING_HOUR AS X_AXIS
            ,DAY_OF_WEEK AS Y_AXIS
        FROM (
            SELECT
                (SELECT CONCAT(FIRST_NAME, ' ', LAST_NAME) FROM USER WHERE USER_ID = TIMECLOCK.USER_ID) AS FULL_NAME
                ,days.DAY_OF_WEEK
                ,COALESCE(ROUND(AVG(TIME_TO_SEC(TIME(TIMECLOCK.TOTAL_TIME)) / 3600), 2), 0) AS AVG_WORKING_HOUR
            FROM (
                    SELECT 1 AS DAY_ORDER, 'Sunday' AS DAY_OF_WEEK UNION ALL
                    SELECT 2 AS DAY_ORDER, 'Monday' AS DAY_OF_WEEK UNION ALL
                    SELECT 3 AS DAY_ORDER, 'Tuesday' AS DAY_OF_WEEK UNION ALL
                    SELECT 4 AS DAY_ORDER, 'Wednesday' AS DAY_OF_WEEK UNION ALL
                    SELECT 5 AS DAY_ORDER, 'Thursday' AS DAY_OF_WEEK UNION ALL
                    SELECT 6 AS DAY_ORDER, 'Friday' AS DAY_OF_WEEK UNION ALL
                    SELECT 7 AS DAY_ORDER, 'Saturday' AS DAY_OF_WEEK
                ) AS days
            LEFT JOIN TIMECLOCK
                ON days.DAY_OF_WEEK = DAYNAME(TIMECLOCK.TIME_IN)
                AND TIMECLOCK.TIME_OUT IS NOT NULL
            GROUP BY TIMECLOCK.USER_ID, days.DAY_OF_WEEK
            ORDER BY TIMECLOCK.USER_ID, days.DAY_ORDER
        ) t
    `,
    'fetchTotalSalaryPaid':`
        SELECT
            1 AS ID
            ,MONTHLY_SALARY_PAY AS X_AXIS
            ,MONTH_YEAR AS Y_AXIS
        FROM (
            SELECT 
                CONCAT(MONTHNAME(PAY_PERIOD_FROM), ' ', YEAR(PAY_PERIOD_FROM)) AS MONTH_YEAR
                ,SUM(TOTAL_NET_PAY) AS MONTHLY_SALARY_PAY
            FROM PAYROLL
            WHERE MONTH(PAY_PERIOD_FROM) = MONTH(PAY_PERIOD_TO) AND YEAR(PAY_PERIOD_FROM) = YEAR(PAY_PERIOD_TO)
            GROUP BY MONTH_YEAR
            ORDER BY MIN(PAY_PERIOD_FROM)
        ) t
    `,
};

