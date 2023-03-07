export const sqlQuery = {
    //-----AUTH
    'fetchRoleQuery': `
        SELECT ROLE
        FROM USER
        WHERE EMAIL = ?
    `,
    //-----TIME ENTRY
    'fetchTimeEntryDayQuery': `
        SELECT
            TIMECLOCK.TIME
            ,TIMECLOCK.ACTION
        FROM TIMECLOCK TIMECLOCK
            ,USER
        WHERE 1=1
            AND TIMECLOCK.USER_ID = USER.USER_ID
            AND USER.EMAIL = ?
            AND DATE_FORMAT(TIMECLOCK.TIME, '%Y-%m-%d') = DATE_FORMAT(STR_TO_DATE(?, '%m/%d/%Y'), '%Y-%m-%d')
    `,
    'fetchTimeEntryMonthQuery': `
        SELECT DISTINCT
            DATE(TIMECLOCK.TIME) AS DATE
        FROM TIMECLOCK TIMECLOCK
            ,USER
        WHERE 1=1
            AND TIMECLOCK.USER_ID = USER.USER_ID
            AND USER.EMAIL = ?
            AND DATE_FORMAT(TIMECLOCK.TIME, '%Y-%m') = DATE_FORMAT(STR_TO_DATE(?, '%m/%Y'), '%Y-%m')
    `,
    'submitTimeEntry': `
        INSERT INTO TIMECLOCK (USER_ID, ACTION)
        SELECT USER_ID, CUR_ACTION
        FROM (
            SELECT USR.USER_ID, PAR_ACT.ACTION AS CUR_ACTION, TMP_PREV_ACT.ACTION AS PREV_ACTION
            FROM USER USR
                JOIN (SELECT ? AS EMAIL FROM DUAL) PAR_EML
                    ON USR.EMAIL = PAR_EML.EMAIL
                JOIN (SELECT ? AS ACTION FROM DUAL) PAR_ACT
                    ON 1=1
                JOIN (SELECT USER_ID
                        ,ACTION
                        ,ROW_NUMBER() OVER (PARTITION BY USER_ID ORDER BY TIME DESC) AS RN
                    FROM TIMECLOCK
                ) TMP_PREV_ACT
                    ON TMP_PREV_ACT.USER_ID = USR.USER_ID
                    AND TMP_PREV_ACT.RN = 1
            WHERE 1=1
                AND PAR_ACT.ACTION IN ('IN', 'OUT', 'BREAK')
        ) t
        WHERE 1=1
            AND (
                    (CUR_ACTION = 'IN' AND PREV_ACTION = 'OUT')
                    OR
                    (CUR_ACTION IN ('OUT', 'BREAK') AND PREV_ACTION != 'OUT')
            )
    `
};

