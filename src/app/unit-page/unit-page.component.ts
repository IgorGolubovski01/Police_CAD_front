import { Component, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { UnitService } from '../services/unit.service';
import { LatLonModel } from '../models/latlon.model';

@Component({
  selector: 'app-unit-page',
  imports: [],
  templateUrl: './unit-page.component.html',
  styleUrl: './unit-page.component.css'
})
export class UnitPageComponent implements OnDestroy {
  private locationUpdateInterval: any;

  ngOnInit() {
    const user = UserService.checkActive();
    if (user == null || user.role !== 'ROLE_UNIT') {
      window.location.href = '/home';
      return;
    }

    // Update location immediately
    this.updateLocation(user.id);

    // Set up interval to update every 10 seconds
    this.locationUpdateInterval = setInterval(() => {
      this.updateLocation(user.id);
    }, 10000);
  }

  private async updateLocation(userId: number) {
    try {
      const coords = await LocationService.getCurrentLocation();
      console.log(`Current location: ${coords.latitude}, ${coords.longitude}`);
      
      const locationData: LatLonModel = {
        uId: userId,
        lat: coords.latitude,
        lon: coords.longitude
      };

      await UnitService.updateLocation(locationData);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  ngOnDestroy() {
    // Clear interval when component is destroyed
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
  }
}
