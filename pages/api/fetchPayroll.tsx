export default async function handler(req: any, res: any){

  try {
    console.log(req.body);
    const province = req.body.province;
    const annualPayPeriods = req.body.annualPayPeriods;
    const wages = req.body.wages as number;
    const vacationPay = req.body.vacationPay as number;

    if ((!province || !annualPayPeriods || !wages || !vacationPay)
        || (wages == 0 || vacationPay == 0)) {
        res.status(500).json({ error: 'Invalid data!' });
    }

    const headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-CA,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,en-US;q=0.6",
        "Content-Type": "application/json",
        "Origin": "https://www.adp.ca",
        "Referer": "https://www.adp.ca/",
        "Sec-Ch-Ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "X-Api-Key": "AZWjxlCDYZ8DSDLEOJt1w4pZb0WhzVvO1fboG2iX"
    };

    const body = JSON.stringify({
        "province": province,
        "annualPayPeriods": annualPayPeriods,
        "birthDate": " ",
        "federalTD1": {
          "totalClaimAmount": 1,
          "noIncomeTaxDeductions": false,
          "HD": 0,
          "L": 0,
          "CRA_F1": 0,
          "CRA_K3": 0
        },
        "federalTD1X": {
          "I1": 0,
          "E": 0
        },
        "provincialTD1P": {
          "totalClaimAmount": 1,
          "noIncomeTaxDeductions": false,
          "CRA_K3P": 0,
          "CRA_Y": 0
        },
        "exemptions": {
          "CPP": false,
          "EI": false,
          "PPIP": false
        },
        "ytdPayroll": {
          "ytdIncome": {
            "wages": 0,
            "pension": 0,
            "vacationPay": 0,
            "bonus": 0,
            "comm": 0,
            "txCashBenefits": 0,
            "txNonCashBenefits": 0
          },
          "ytdDeductions": {
            "CPP": 0,
            "EI": 0,
            "PPIP": 0,
            "ITD": 0,
            "LSFp": 0,
            "LSFpProv": 0,
            "LSFp_P": 0,
            "F": 0,
            "U1": 0,
            "F2": 0,
            "L": 0
          }
        },
        "currentPayroll": {
          "payDate": "2023-06-27",
          "calcType": 1,
          "calcMethod": 0,
          "payPeriod": 0,
          "cntPP": 0,
          "noCppBasicExemption": false,
          "employerEIfactor": 0,
          "income": {
            "wages": wages,
            "vacationPay": vacationPay,
            "retroPayPeriods": 1,
            "daysSincePrevCommPmt": 0,
            "txCashBenefits": 0,
            "txNonCashBenefits": 0
          },
          "deductions": {
            "F": 0,
            "U1": 0,
            "F2": 0,
            "bonus": 0,
            "retroPay": 0
          }
        }
    });

    const apiUrlEndpoint = 'https://api.metca.net/cptl/tax/calculate';
    const postData = {
            method: 'POST',
            headers: headers,
            body: body,
    }
    
    const response = await fetch(apiUrlEndpoint, postData);
    const result = await response.json();

    const CPP = result.employeePayrollDeductions.CPP;
    const EI = result.employeePayrollDeductions.EI;
    const taxFed = result.employeePayrollDeductions.ITDfed;
    const taxProv = result.employeePayrollDeductions.ITDprov;
    const totalTax = taxFed + taxProv;

    const totalEarnings = wages + vacationPay;
    const totalDeduction = result.employeePayrollDeductions.CPP + result.employeePayrollDeductions.EI + result.employeePayrollDeductions.ITD;
    const totalNetPay = totalEarnings - totalDeduction;

    const data = {
        wages: wages,
        vacationPay: vacationPay,
        CPP: CPP,
        EI: EI,
        taxFed: taxFed,
        taxProv: taxProv,
        totalEarnings: totalEarnings,
        totalTax: totalTax,
        totalDeduction: totalDeduction,
        totalNetPay: totalNetPay,
    }
    
    res.status(200).json({ data: data });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
}