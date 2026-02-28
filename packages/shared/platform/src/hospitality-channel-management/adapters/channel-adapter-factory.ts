/**
 * Channel Adapter Factory
 * 
 * Factory pattern for creating channel-specific adapters
 * 
 * @author webwakaagent4
 * @step 438
 */

import { ChannelType, IChannelAdapter } from '../types';
import { BookingComAdapter } from './booking-com-adapter';
import { ExpediaAdapter } from './expedia-adapter';
import { AirbnbAdapter } from './airbnb-adapter';
import { HotelsComAdapter } from './hotels-com-adapter';

export function getChannelAdapter(channelType: ChannelType): IChannelAdapter {
  switch (channelType) {
    case 'booking_com':
      return new BookingComAdapter();
    case 'expedia':
      return new ExpediaAdapter();
    case 'airbnb':
      return new AirbnbAdapter();
    case 'hotels_com':
      return new HotelsComAdapter();
    default:
      throw new Error(`Unsupported channel type: ${channelType}`);
  }
}
