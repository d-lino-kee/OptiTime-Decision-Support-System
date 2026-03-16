import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [AppConfigService],
  useFactory: (cfg: AppConfigService) => {
    if (admin.apps.length) return admin.app();
    return admin.initializeApp({ projectId: cfg.firebaseProjectId });
  },
};
