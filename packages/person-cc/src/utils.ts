import { appConstants as c } from '@solidary-network/common-cc';
import * as bcrypt from 'bcrypt';
import { Person } from './person.model';
import { Participant } from '@solidary-network/participant-cc';

// duplicated with 
// packages/person-cc/src/utils.ts
// packages/participant-cc/src/utils.ts

const bcryptSaltRounds: number = 10;

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, bcryptSaltRounds);
};

/**
 * every model has is checkUniqueField implementation with its type
 * richQuery helper to check unique fields on model Person
 */
export const checkUniqueField = async (fieldName: string, fieldValue: string, required: boolean) => {
  if (!required && !fieldValue) {
    return;
  }
  const exists = await Person.query(Person, {
    selector: {
      type: c.CONVECTOR_MODEL_PATH_PERSON,
      [fieldName]: fieldValue,
    }
  });
  if ((exists as Person[]).length > 0) {
    // remove first _ ex _id to id before display error
    const fieldDisplay: string = (fieldName.startsWith('_')) ? fieldName.substr(1, fieldName.length) : fieldName;
    throw new Error(`There is a person registered with that ${fieldDisplay} '${fieldValue}'`);
  }
}

/**
 * common helper to check if sender is government
 */
export const checkIfSenderIsGovernment = async (gov: Participant, sender: string) => {
  if (!gov || !gov.identities) {
    throw new Error('No government identity has been registered yet');
  }
  const govActiveIdentity = gov.identities.find(identity => identity.status === true);

  if (!govActiveIdentity) {
    throw new Error('No active identity found for participant');
  }

  if (sender !== govActiveIdentity.fingerprint) {
    // throw new Error(`Just the government - ID=gov - can create people - requesting organization was ${this.sender}`);
    throw new Error('Just the government (participant with id gov) can create people');
  }
}