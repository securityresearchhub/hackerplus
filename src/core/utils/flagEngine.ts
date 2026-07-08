const CHALLENGE_FLAGS: { [id: string]: string } = {
  ch1: 'hp_flag{f1l3_upl0ad_bypass_982}',
  ch2: 'hp_flag{sst1_templ4te_inj_481}',
  ch3: 'hp_flag{path_h1j4ck_root_893}',
};

export const FlagEngine = {
  /**
   * Validates a submitted flag against the correct configuration.
   * Returns a validation result with success status and feedback message.
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
  }
};

export default FlagEngine;
