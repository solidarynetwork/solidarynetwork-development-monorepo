import { appConstants as c, entitySchema, x509Identities } from '@solidary-network/common-cc';
import { Participant } from '@solidary-network/participant-cc';
import { ConvectorModel, FlatConvectorModel, ReadOnly, Required, Validate } from '@worldsibu/convector-core-model';
import * as yup from 'yup';
import { ResourceType, TransactionType } from './enums';
import { Entity } from './types';
import { currencySchema, resourceTypeSchema, transactionTypeSchema } from './validation';

export class Transaction extends ConvectorModel<Transaction> {
  @ReadOnly()
  @Required()
  public readonly type = c.CONVECTOR_MODEL_PATH_TRANSACTION;

  // FUCK we can't use @ReadOnly() else yup validations won't work!!!!!!! remove all @ReadOnly() from everywhere

  @Required()
  @Validate(transactionTypeSchema)
  public transactionType: TransactionType;

  @Required()
  @Validate(resourceTypeSchema)
  public resourceType: ResourceType;

  @Required()
  @Validate(entitySchema)
  public input: Entity;

  @Required()
  @Validate(entitySchema)
  public output: Entity;

  @Validate(yup.number().nullable())
  public quantity: number;

  @Validate(currencySchema)
  public currency: string;

  @Validate(yup.string().matches(c.REGEX_LOCATION))
  public location: string;

  @Validate(yup.array().of(yup.string()))
  public tags: string[];
  
  @Validate(yup.object().nullable())
  public metaData: any;

  @Validate(yup.object().nullable())
  public metaDataInternal: any;

  @Required()
  @Validate(yup.number())
  public createdDate: number;

  // DON'T add @Required
  @Validate(Participant.schema())
  public participant: FlatConvectorModel<Participant>;
    
  // DON'T add @Required
  @Validate(yup.array(x509Identities.schema()))
  public identities: Array<FlatConvectorModel<x509Identities>>;

  // optional, only when we transfer assets we require it

  // TODO: remove after we are working with person identities
  // owner
  @Validate(yup.string())
  public ownerUsername: string;

  @Validate(yup.string())
  public assetId: string;

}
