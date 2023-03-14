export const sqlQuery = {
    //-----AUTH
    'fetchRoleQuery': `
        SELECT ROLE
        FROM USER
        WHERE EMAIL = ?
    `,
    //-----TIME ENTRY
    'fetchTimeEntryDayQuery': `
        WITH TMP AS (
            SELECT
                TIMECLOCK.USER_ID
                ,TIMECLOCK.ACTION
                ,TIME_FORMAT(TIMECLOCK.TIME, '%H:%i') AS TIME
                ,ROW_NUMBER() OVER (PARTITION BY TIMECLOCK.USER_ID ORDER BY TIMECLOCK.DATE, TIMECLOCK.TIME) AS RN
            FROM TIMECLOCK
                ,USER
            WHERE 1=1
                AND USER.EMAIL = ?
                AND TIMECLOCK.USER_ID = USER.USER_ID
                AND TIMECLOCK.ACTION IN ('IN', 'OUT')
                AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
        )
        
        SELECT
            T1.TIME AS TIME_IN
            ,T2.TIME AS TIME_OUT
        FROM
            TMP T1
        LEFT JOIN TMP T2 ON 1=1
            AND T1.USER_ID = T2.USER_ID
            AND T2.RN = T1.RN + 1
            AND T2.ACTION = 'OUT'
        WHERE 1=1
            AND T1.ACTION = 'IN'
    `,
    'fetchBreakDayQuery': `
        SELECT
            COUNT(*) AS BREAK_NUM
        FROM TIMECLOCK TIMECLOCK
            ,USER
        WHERE 1=1
            AND USER.EMAIL = ?
            AND TIMECLOCK.USER_ID = USER.USER_ID
            AND TIMECLOCK.ACTION = 'BREAK'
            AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
    `,
    'fetchTimeEntryMonthQuery': `
        SELECT DISTINCT DATE_FORMAT(TIMECLOCK.DATE, '%m/%d/%Y') AS DATE
        FROM TIMECLOCK TIMECLOCK
            ,USER
        WHERE 1=1
            AND TIMECLOCK.USER_ID = USER.USER_ID
            AND USER.EMAIL = ?
            AND DATE_FORMAT(TIMECLOCK.DATE, '%Y-%m') = DATE_FORMAT(STR_TO_DATE(?, '%m/%Y'), '%Y-%m')
    `,
    'submitTimeEntry': `
        INSERT INTO TIMECLOCK (USER_ID, ACTION, DATE, TIME)
        SELECT USER_ID, CUR_ACTION, NOW(), NOW()
        FROM (
            SELECT USR.USER_ID, PAR_ACT.ACTION AS CUR_ACTION, TMP_PREV_ACT.ACTION AS PREV_ACTION
            FROM USER USR
                JOIN (SELECT ? AS EMAIL FROM DUAL) PAR_EML
                    ON USR.EMAIL = PAR_EML.EMAIL
                JOIN (SELECT ? AS ACTION FROM DUAL) PAR_ACT
                    ON 1=1
                LEFT JOIN (SELECT USER_ID
                        ,ACTION
                        ,ROW_NUMBER() OVER (PARTITION BY USER_ID ORDER BY DATE DESC, TIME DESC) AS RN
                    FROM TIMECLOCK
                    WHERE ACTION IN ('IN', 'OUT')
                ) TMP_PREV_ACT
                    ON TMP_PREV_ACT.USER_ID = USR.USER_ID
                    AND TMP_PREV_ACT.RN = 1
            WHERE 1=1
                AND PAR_ACT.ACTION IN ('IN', 'OUT', 'BREAK')
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
    'submitAddEmployee': `
            INSERT INTO USER (FIRST_NAME, LAST_NAME, EMAIL, CREATED_BY)
            SELECT ?, ?, ?, USER.USER_ID
            FROM USER
            WHERE USER.EMAIL = ?
    `,
    'submitApproveTimeSheet': `
    `,
};

