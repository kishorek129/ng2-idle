import {fakeAsync, tick} from '@angular/core/testing';

import {EventTargetInterruptSource} from './eventtargetinterruptsource';

export function main() {
  describe('EventTargetInterruptSource', () => {

    it('emits onInterrupt event when attached and event is fired', fakeAsync(() => {
         let source = new EventTargetInterruptSource(document.body, 'click');
         spyOn(source.onInterrupt, 'emit').and.callThrough();
         source.attach();

         let expected = new Event('click');
         document.body.dispatchEvent(expected);

         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         source.detach();
       }));

    it('emits onInterrupt event when multiple events are specified and one is triggered',
       fakeAsync(() => {
         let source = new EventTargetInterruptSource(document.body, 'click touch');
         spyOn(source.onInterrupt, 'emit').and.callThrough();
         source.attach();

         let expected = new Event('click');
         document.body.dispatchEvent(expected);

         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         source.detach();
       }));

    it('does not emit onInterrupt event when detached and event is fired', fakeAsync(() => {
         let source = new EventTargetInterruptSource(document.body, 'click');
         spyOn(source.onInterrupt, 'emit').and.callThrough();

         // make it interesting by attaching and detaching
         source.attach();
         source.detach();

         let expected = new Event('click');
         document.body.dispatchEvent(expected);

         expect(source.onInterrupt.emit).not.toHaveBeenCalled();
       }));

    it('should throttle target events using the specified throttleDelay value', fakeAsync(() => {
         let source = new EventTargetInterruptSource(document.body, 'click', 500);
         spyOn(source.onInterrupt, 'emit').and.callThrough();
         source.attach();

         // two immediate calls should get throttled to only 1 call
         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         // call halfway through the delay should still only yield one call
         tick(250);
         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         // the throttle delay has now been met, so the next event should result in an additional
         // call
         tick(250);
         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(2);

         // another 500ms has passed so the next event should result in yet another call
         tick(500);
         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(3);

         // need to detach and do one full iteration to remove throttle timers or test will fail
         source.detach();
         tick(500);
       }));

    it('should not throttle target events if throttleDelay is 0', fakeAsync(() => {
         let source = new EventTargetInterruptSource(document.body, 'click', 0);
         spyOn(source.onInterrupt, 'emit').and.callThrough();
         source.attach();

         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(1);

         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(2);

         tick(250);
         document.body.dispatchEvent(new Event('click'));
         expect(source.onInterrupt.emit).toHaveBeenCalledTimes(3);

         // need to detach and do one full iteration to remove throttle timers or test will fail
         source.detach();
       }));
  });
}
