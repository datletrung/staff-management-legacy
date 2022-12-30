export const fetchCalendarDateQuery = `
SELECT   t.DATE_ID
    ,t.WEEKDAY
    ,t.DAY
    ,t.MONTH
    ,t.YEAR
    ,t.WEEK_OF_YEAR
    ,CONCAT(t.DAY, '/', t.MONTH) AS FORMATTED_DATE
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
`;