const CHALLENGE_FLAGS: { [id: string]: string } = {
  ch1: 'hp_flag{f1l3_upl0ad_bypass_982}',
  ch2: 'hp_flag{sst1_templ4te_inj_481}',
  ch3: 'hp_flag{path_h1j4ck_root_893}',
};

const LAB_FLAGS: { [id: string]: string } = {
  lab1: 'hp_flag{sql_login_bypass_728}',
  lab2: 'hp_flag{idor_access_control_937}',
  lab3: 'hp_flag{suid_priv_esc_219}',
};

export const FlagEngine = {
  /**
   * Validates a submitted challenge flag against configurations.
   */
  validateFlag(challengeId: string, flag: string): { success: boolean; message: string } {
    const cleanFlag = flag.trim();
    if (!cleanFlag) {
      return { success: false, message: 'OPERATIVE WARNING: Please enter a flag to submit.' };
    }

    const expectedFlag = CHALLENGE_FLAGS[challengeId] || `hp_flag{${challengeId}_solved_signature}`;

    if (cleanFlag === expectedFlag) {
      return {
        success: true,
        message: 'DECRYPTION SUCCESSFUL: Security signature validated. Flag accepted.',
      };
    } else {
      return {
        success: false,
        message: 'DECRYPTION FAILED: Invalid security signature. Attempt logged.',
      };
    }
  },

  /**
   * Validates a submitted lab flag against configurations.
   */
  validateLabFlag(labId: string, flag: string): { success: boolean; message: string } {
    const cleanFlag = flag.trim();
    if (!cleanFlag) {
      return { success: false, message: 'OPERATIVE WARNING: Please enter a flag to submit.' };
    }

    const expectedFlag = LAB_FLAGS[labId] || `hp_flag{${labId}_solved_signature}`;

    if (cleanFlag === expectedFlag) {
      return {
        success: true,
        message: 'DECRYPTION SUCCESSFUL: Security signature validated. Lab resolved.',
      };
    } else {
      return {
        success: false,
        message: 'DECRYPTION FAILED: Invalid security signature. Attempt logged.',
      };
    }
  }
};

export default FlagEngine;
