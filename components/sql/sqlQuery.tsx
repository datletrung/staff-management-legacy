export const sqlQuery = {
    //-----AUTH
    'fetchRoleQuery': `
        SELECT ROLE
        FROM USER
        WHERE EMAIL = ?
        AND ACTIVE_FLAG = 'Y'
        AND LOCKED_FLAG = 'N'
    `,
    //-----TIME ENTRY
    'fetchTimeEntryDayQuery': `
        WITH TMP AS (
            SELECT
                TIMECLOCK.USER_ID
                ,TIMECLOCK.ACTION
                ,DATE_FORMAT(TIMECLOCK.DATE, '%m/%d/%Y') AS DATE
                ,TIME_FORMAT(TIMECLOCK.TIME, '%H:%i:%s') AS TIME
                ,ROW_NUMBER() OVER (PARTITION BY TIMECLOCK.USER_ID ORDER BY TIMECLOCK.DATE, TIMECLOCK.TIME) AS RN
            FROM TIMECLOCK
            WHERE 1=1
                AND TIMECLOCK.ACTION IN ('IN', 'OUT')
                AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
        )        
        SELECT DATE, TIME_IN, TIME_OUT
        FROM (
            SELECT
                USER_ID
                ,DATE
                ,NULL AS TIME_IN
                ,TIME AS TIME_OUT
            FROM TMP
            WHERE 1=1
                AND RN = 1
                AND ACTION = 'OUT'
            UNION ALL
            SELECT
                IFNULL(T1.USER_ID, T2.DATE) AS USER_ID
                ,IFNULL(T1.DATE, T2.DATE) AS DATE
                ,T1.TIME AS TIME_IN
                ,T2.TIME AS TIME_OUT
            FROM USER
            LEFT JOIN TMP T1 ON 1=1
                AND USER.USER_ID = T1.USER_ID
                AND T1.ACTION = 'IN'
            LEFT JOIN TMP T2 ON 1=1
                AND USER.USER_ID = T2.USER_ID
                AND T2.RN = T1.RN + 1
                AND T2.ACTION = 'OUT'
        ) t
        WHERE 1=1
            AND t.USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
    `,
    'fetchBreakDayQuery': `
        SELECT
            COUNT(*) AS BREAK_NUM
        FROM TIMECLOCK
        WHERE 1=1
            AND TIMECLOCK.USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
            AND TIMECLOCK.ACTION = 'BREAK'
            AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
    `,
    'fetchTimeEntryMonthQuery': `
        SELECT
            DISTINCT DATE_FORMAT(TIMECLOCK.DATE, '%m/%d/%Y') AS DATE
        FROM TIMECLOCK
        WHERE 1=1
            AND TIMECLOCK.USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
            AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m') = DATE_FORMAT(STR_TO_DATE(?, '%m/%Y'), '%Y-%m')
    `,
    'submitTimeEntry': `
        INSERT INTO TIMECLOCK (USER_ID, ACTION, DATE, TIME, APPROVED)
        SELECT USER_ID, CUR_ACTION, NOW(), NOW(), APPROVED
        FROM (
            SELECT USER.USER_ID, GET_ACTION.ACTION AS CUR_ACTION, PREV_ACT.ACTION AS PREV_ACTION, IFNULL(APP_SET.SETTING_VALUE, 'N') AS APPROVED
            FROM USER
            JOIN (SELECT USER_ID FROM USER WHERE USER.EMAIL = ? AND ACTIVE_FLAG = 'Y') GET_USER_ID
                ON USER.USER_ID = GET_USER_ID.USER_ID
            JOIN (SELECT ? AS ACTION FROM DUAL) GET_ACTION
                ON GET_ACTION.ACTION IN ('IN', 'OUT', 'BREAK')
            LEFT JOIN (
                SELECT USER_ID, DATE, ACTION, ROW_NUMBER() OVER (PARTITION BY USER_ID ORDER BY DATE DESC, TIME DESC) AS RN
                FROM TIMECLOCK
                WHERE ACTION IN ('IN', 'OUT')
            ) PREV_ACT
                ON PREV_ACT.USER_ID = GET_USER_ID.USER_ID
                AND PREV_ACT.RN = 1
            LEFT JOIN (SELECT SETTING_VALUE FROM APP_SETTING WHERE SETTING_NAME = 'AUTO_APPROVE') APP_SET ON 1=1
        ) t
        WHERE 1=1
        AND (
            (CUR_ACTION = 'IN' AND (PREV_ACTION = 'OUT' OR PREV_ACTION IS NULL))
            OR
            (CUR_ACTION = 'OUT' AND PREV_ACTION = 'IN')
            OR
            CUR_ACTION = 'BREAK'
        )
    `,
    'fetchEmployeeList':`
        SELECT USER_ID, FIRST_NAME, LAST_NAME, EMAIL
        FROM USER
        WHERE 1=1
            AND (ROLE = 'EMPLOYEE' OR EMAIL = 'brianle@lionrocktech.net')
            AND ACTIVE_FLAG = 'Y'
    `,
    'checkAddEmployee':`
            SELECT USER_ID, ACTIVE_FLAG, LOCKED_FLAG
            FROM USER
            WHERE EMAIL = ?
    `,
    'submitAddEmployee': `
        INSERT INTO USER (FIRST_NAME, LAST_NAME, EMAIL, LAST_UPDATED_BY, CREATED_BY)
        SELECT ?, ?, ?, USER.USER_ID, USER.USER_ID
        FROM USER
        WHERE EMAIL = ?
        AND ACTIVE_FLAG = 'Y'
    `,
    'submitRehireEmployee': `
        UPDATE USER AS USR, (SELECT USER_ID FROM USER WHERE EMAIL = ?) AS USR_ID
        SET USR.FIRST_NAME = ?, USR.LAST_NAME = ?, USR.ACTIVE_FLAG = 'Y', USR.LOCKED_FLAG = 'N', USR.LAST_UPDATED_BY = USR_ID.USER_ID
        WHERE USR.USER_ID = ?
    `,
    'approveTimeSheet': `
        UPDATE TIMECLOCK
        SET APPROVED = 'Y', APPROVED_BY = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
        WHERE 1=1
        AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y')
        AND DATE_FORMAT(DATE, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
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
        WHERE EMAIL = ?
        AND ACTIVE_FLAG = 'Y'
    `,
    'setEmployeeOption':`
        UPDATE USER AS USR, (SELECT USER_ID FROM USER WHERE EMAIL = ? AND ACTIVE_FLAG = 'Y') AS USR_ID
        SET USR.ROLE = ?, USR.ACTIVE_FLAG = ?, USR.LOCKED_FLAG = ?
        WHERE USR.USER_ID = USR_ID.USER_ID
    `
};

