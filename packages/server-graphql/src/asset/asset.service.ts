import { Injectable, Logger } from '@nestjs/common';
import { Asset as AssetConvectorModel } from '@solidary-network/asset-cc';
import { FlatConvectorModel } from '@worldsibu/convector-core-model';
import { v4 as uuid } from 'uuid';
import { AssetControllerBackEnd } from '../convector';
import { NewAssetInput } from './dto';
import { Asset } from './models';
import { GetByComplexQueryInput, PaginationArgs } from '../common/dto';

@Injectable()
export class AssetService {
  async create(data: NewAssetInput): Promise<Asset> {
    try {
      // compose ConvectorModel from NewInput
      const assetToCreate: AssetConvectorModel = new AssetConvectorModel({
        ...data,
        // require to inject values
        id: data.id ? data.id : uuid(),
        // convert Date to epoch unix time to be stored in convector asset model
        // startDate: ((data.startDate as unknown) as number),
        // endDate: ((data.endDate as unknown) as number),
        // TODO: leave it for chaincode
        createdDate: ((new Date().getTime()) as number),
      });

      await AssetControllerBackEnd.create(assetToCreate);
      return this.findOneById(data.id);
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<Asset[]> {
    try {
      const convectorModel: Array<FlatConvectorModel<AssetConvectorModel>> = await AssetControllerBackEnd.getAll();
      // require to map fabric model to graphql Asset[]
      return (paginationArgs)
        ? convectorModel.splice(paginationArgs.skip, paginationArgs.take) as Asset[]
        : convectorModel as Asset[];
    } catch (error) {
      Logger.error(JSON.stringify(error));
      throw error;
    }
  }

  async findComplexQuery(getByComplexQueryInput: GetByComplexQueryInput, assetArgs: PaginationArgs): Promise<Asset | Asset[]> {
    // get fabric model with _props
    const fabricModel: Array<FlatConvectorModel<AssetConvectorModel>> = await AssetControllerBackEnd.getComplexQuery(getByComplexQueryInput) as AssetConvectorModel[];
    // convert fabric model to convector model (remove _props)
    const convectorModel: AssetConvectorModel[] = fabricModel.map((e: AssetConvectorModel) => new AssetConvectorModel(e));
    // call common find method
    const model: Asset[] = await this.findBy(convectorModel, assetArgs) as Asset[];
    // return model
    return model;
  }

  async findOneById(id: string): Promise<Asset> {
    try {
      // get fabric model with _props
      const fabricModel: AssetConvectorModel = await AssetControllerBackEnd.get(id) as AssetConvectorModel;
      // convert fabric model to convector model (remove _props)
      const convectorModel = new AssetConvectorModel(fabricModel).toJSON();
      // trick: must return convector model as a graphql model, to prevent property conversion problems
      return (convectorModel as Asset);
    } catch (error) {
      throw error;
    }
  }

  /**
   * shared findBy method
   */
  async findBy(convectorModel: AssetConvectorModel | AssetConvectorModel[], assetArgs: PaginationArgs): Promise<Asset | Asset[]> {
    try {
      // working in array mode
      if (Array.isArray(convectorModel)) {
        // require to map fabric model to graphql Asset[]
        return (assetArgs)
          ? convectorModel.splice(assetArgs.skip, assetArgs.take) as unknown as Asset[]
          : convectorModel as unknown as Asset[];
      } else {
        // only convert attributes if have attributes array
        // require to map fabric model to graphql Asset[]
        return convectorModel as unknown as Asset;
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

}
