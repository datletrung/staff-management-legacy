DELIMITER //
CREATE PROCEDURE SUBMIT_TIMECLOCK(
	IN UserEmail VARCHAR(255)
)
BEGIN
    IF EXISTS (
            SELECT 1
            FROM TIMECLOCK
            WHERE 1=1
                AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = UserEmail)
                AND TIME_OUT IS NULL
    )
    THEN
        UPDATE TIMECLOCK AS TC
        SET
            TIME_OUT = NOW()
            ,TOTAL_TIME = TIMEDIFF(NOW(),
                (
                    SELECT TIME_IN
                    FROM TIMECLOCK
                    WHERE 1=1
                        AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = UserEmail)
                        AND TIME_OUT IS NULL
                )
            )
        WHERE 1=1
            AND USER_ID = (SELECT USER_ID FROM USER WHERE EMAIL = UserEmail)
            AND TIME_OUT IS NULL;
    ELSE 
        INSERT INTO TIMECLOCK (`USER_ID`, `TIME_IN`, `APPROVED`)
        SELECT 
            (SELECT USER_ID FROM USER WHERE EMAIL = UserEmail) AS USER_ID
            ,NOW()
            ,(SELECT IFNULL(SETTING_VALUE, 'N') FROM APP_SETTING WHERE SETTING_NAME = 'AUTO_APPROVE') AS APPROVED
        FROM DUAL;
    END IF;
END //
DELIMITER;

#--CALL SUBMIT_TIMECLOCK('brianle@lionrocktech.net');