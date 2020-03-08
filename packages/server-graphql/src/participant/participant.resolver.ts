import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'apollo-server-express';
import { GqlAuthGuard } from '../auth/guards';
import { GetByComplexQueryInput, PaginationArgs } from '../common/dto';
import { NewParticipantInput } from './dto';
import { Participant } from './models/participant.model';
import { ParticipantService } from './participant.service';

const pubSub = new PubSub();

@UseGuards(GqlAuthGuard)
@Resolver(of => Participant)
export class ParticipantResolver {
  constructor(private readonly participantService: ParticipantService) { }

  @Query(returns => [Participant])
  participants(
    @Args() participantsArgs: PaginationArgs,
  ): Promise<Participant[]> {
    return this.participantService.findAll(participantsArgs);
  }

  @Query(returns => [Participant])
  participantComplexQuery(
    @Args('getByComplexQueryInput') getByComplexQueryInput: GetByComplexQueryInput,
    @Args() participantsArgs: PaginationArgs,
  ): Promise<Participant | Participant[]> {
    return this.participantService.findComplexQuery(getByComplexQueryInput, participantsArgs);
  }

  @Query(returns => Participant)
  async participantById(
    @Args('id') id: string,
  ): Promise<Participant> {
    const participant = await this.participantService.findOneById(id);
    if (!participant) {
      throw new NotFoundException(id);
    }
    return participant;
  }

  @Mutation(returns => Participant)
  async participantNew(
    @Args('newParticipantData') newParticipantData: NewParticipantInput,
  ): Promise<Participant> {
    const participant = await this.participantService.create(newParticipantData);
    // fire subscription
    pubSub.publish('participantAdded', { participantAdded: participant });
    return participant;
  }

  @Subscription(returns => Participant)
  participantAdded() {
    return pubSub.asyncIterator('participantAdded');
  }
}
