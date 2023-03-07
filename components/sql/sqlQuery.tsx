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
            SELECT USER_ID, ?
            FROM USER
            WHERE EMAIL = ?
                
    `
};

