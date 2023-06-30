export const sqlQuery = {
    //-----AUTH
    'fetchRole': `
        SELECT
            USER_ID
            ,ROLE
            ,CONCAT(FIRST_NAME, ' ', LAST_NAME) AS NAME
        FROM USER
        WHERE 1=1
        AND (EMAIL = ? OR USER_ID = ?)
        AND PASSWORD = ?
        AND ACTIVE_FLAG = 'Y'
        AND LOCKED_FLAG = 'N'
    `,
    //-----TIME ENTRY
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
                AND T1.USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
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
            AND T.USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ?)
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
                AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ?)
        ) T
        GROUP BY USER_ID
    `,
    'submitTimeEntry': `
        CALL SUBMIT_TIMECLOCK(?)
    `,
    //-----MANAGER ZONE
    'fetchEmployeeList':`
        SELECT USER_ID, FIRST_NAME, LAST_NAME, EMAIL
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
            AND EMAIL = ?
            AND ACTIVE_FLAG = 'Y'
    `,
    'submitRehireEmployee': `
        UPDATE USER AS USR, (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y') AS GET_UPDATE_BY_USR_ID
        SET USR.FIRST_NAME = ?
            ,USR.LAST_NAME = ?
            ,USR.PASSWORD = ?
            ,USR.ACTIVE_FLAG = 'Y'
            ,USR.LOCKED_FLAG = 'N'
            ,USR.LAST_UPDATED_AT = NOW()
            ,USR.LAST_UPDATED_BY = GET_UPDATE_BY_USR_ID.USER_ID
        WHERE USR.USER_ID = ?
    `,
    'approveTimeSheet': `
        UPDATE TIMECLOCK
        SET APPROVED = 'Y', APPROVED_BY = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
        WHERE 1=1
            AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ?)
            AND (DATE_FORMAT(TIME_IN, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
                OR DATE_FORMAT(TIME_OUT, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
            )

    `,
    'fetchAutoApproveSetting':`
        SELECT SETTING_VALUE
        FROM APP_SETTING
        WHERE SETTING_NAME = 'AUTO_APPROVE'
    `,
    'updateAutoApproveSetting':`
        UPDATE APP_SETTING
        SET SETTING_VALUE = ?
        WHERE SETTING_NAME = 'AUTO_APPROVE'
    `,
    'fetchEmployeeOption':`
        SELECT ROLE, LOCKED_FLAG
        FROM USER
        WHERE 1=1
            AND EMAIL = ?
            AND ACTIVE_FLAG = 'Y'
    `,
    'setEmployeeOption':`
        UPDATE USER AS USR
                ,(SELECT USER_ID FROM USER WHERE EMAIL = ?) AS GET_USR_ID
                ,(SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y') AS GET_UPDATE_BY_USR_ID
        SET USR.ROLE = ?
            ,USR.ACTIVE_FLAG = ?
            ,USR.LOCKED_FLAG = ?
            ,USR.LAST_UPDATED_AT = NOW()
            ,USR.LAST_UPDATED_BY = GET_UPDATE_BY_USR_ID.USER_ID
        WHERE USR.USER_ID = GET_USR_ID.USER_ID
    `,
    //-----PROFILE
    'fetchPersonalInfo':`
        SELECT
            EMAIL
            ,FIRST_NAME
            ,LAST_NAME
        FROM USER
        WHERE USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
    `,
    'updatePersonalInfo':`
        UPDATE USER
        SET EMAIL = ?, FIRST_NAME = ?, LAST_NAME = ?
        WHERE USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
    `,
    'updatePassword':`
        UPDATE USER
        SET PASSWORD = ?
        WHERE 1=1
        AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
        AND PASSWORD = ?
    `,
};

