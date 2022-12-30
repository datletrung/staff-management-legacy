export const fetchTimeClockQuery = `
SELECT
    TC.DATE_ID
    ,GROUP_CONCAT(TC.TIMECLOCK_ID ORDER BY TC.TIME SEPARATOR  ',') AS TIMECLOCK_ID
    ,GROUP_CONCAT(TC.TIME ORDER BY TC.TIME SEPARATOR  ',') AS TIME
    ,GROUP_CONCAT(TC.ACTION ORDER BY TC.TIME SEPARATOR  ',') AS ACTION
    ,GROUP_CONCAT(TC.OVERRIDDEN ORDER BY TC.TIME SEPARATOR  ',') AS OVERRIDDEN
FROM CALENDAR_VL CVL
    ,USER USR
    ,TIMECLOCK TC
WHERE 1=1
    AND USR.USER_ID = TC.USER_ID
    AND CVL.DATE_ID = TC.DATE_ID
    AND TC.STATUS IN ('SUBMITTED', 'SAVED')
    AND USR.EMAIL = ?
    AND TC.DATE_ID IN (
        SELECT   t.DATE_ID
        FROM CALENDAR_VL t
        JOIN ( 
                    SELECT DAY
                            ,MONTH
                            ,YEAR
                            ,WEEK_OF_YEAR
                    FROM
                    CALENDAR_VL
                    WHERE 1=1
                        AND DAY = DATE_FORMAT(CURRENT_TIMESTAMP(),'%d')
                        AND MONTH = DATE_FORMAT(CURRENT_TIMESTAMP(),'%m')
                        AND YEAR = DATE_FORMAT(CURRENT_TIMESTAMP(),'%Y')
            ) t1
            ON t.WEEK_OF_YEAR = t1.WEEK_OF_YEAR
                AND ((t.YEAR = t1.YEAR AND t.MONTH >= t1.MONTH) OR (t.YEAR = t1.YEAR+1 AND t.MONTH = 1))
        ORDER BY t.YEAR ASC
                ,t.MONTH ASC
                ,t.DAY ASC
    )
GROUP BY TC.DATE_ID
ORDER BY TC.DATE_ID ASC
`;