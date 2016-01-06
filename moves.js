//comment
var moves = {
	default : {
		file : 'test_images/prince/turnaround.png',
		name: 'default',
		number_of_frames : 1,
		frame_height : 98,
		frame_widths : [25],
		reversible: false,
		reverses, false,
		default_direction: 'left',
		leadout_animations : [
			{
				weight: 2,
				name: 'standing_jump'
			},
			{
				weight: 1,
				name: 'turnaround'
			} 
		],
		leadin_animations : []
	}, 
	turnaround : {
		file : 'test_images/prince/turnaround.png',
		name: 'turnaround',
		number_of_frames : 9,
		frame_height : 98,
		reversible: true,
		reverses: true,
		default_direction: 'left',
		frame_numbers: [ 0,  1,  2,  3,  4,  5,  6,  7,  8],
		frame_widths : [37, 35, 35, 40, 47, 52, 45, 40, 49],
		leadout_animations : [
			{
				weight: 2,
				name: 'standing_jump'
			},
		],
		leadin_animations : ['standing_jump']
	},
	standing_jump : {
		file : 'test_images/prince/standing_jump.png',
		name: 'standing_jump',
		number_of_frames : 17,
		frame_height : 114,
		reversible: true,
		reverses, false,
		default_direction: 'left',
		frame_numbers: [ 0,  1,  2,  3,  4,  5,  6,  7,   8,   9, 10, 11, 12, 13, 14, 15, 16],
		frame_widths : [53, 44, 53, 53, 73, 72, 64, 76, 103, 115, 98, 69, 52, 68, 58, 51, 46],
		leadout_animations : [
			{
				weight: 1,
				name: 'turnaround'
			} 
		],
		leadin_animations : ['turnaround']
	}
};

var animator_template = function(moves, canvas){
	var self = this;
	self.canvas = canvas;
	self.moves = moves;
	self.current_move = self.moves.default;
	self.current_frame = 0;
	self.time_per_frame = 60;
	self.current_framepoint = 0;
	self.timer = null;
	self.total_frames  = 0;
	self.max_frames = 120; //testing value
	self.playing = false;
	self.direction = 'left';
	self.speed = 'normal';
	self.init = function(){
		console.log('initing');
		/*
		for(var move_index in self.moves){
			console.log('processing ',self.moves[move_index]);
			var total_weight=0;
			for(var leadout_index in self.moves[move_index].leadout_animations){
				console.log('adding '+ self.moves[move_index].leadout_animations[leadout_index].weight+ ' to '+ total_weight);
				total_weight+=self.moves[move_index].leadout_animations[leadout_index].weight;
			}
			for(var leadout_index in self.moves[move_index].leadout_animations){
				self.moves[move_index].leadout_animations[leadout_index].percent_chance = self.moves[move_index].leadout_animations[leadout_index].weight / total_weight;
			}
		}
		*/
		for(var move_index in self.moves){
			self.moves[move_index].choice_array =[];
			for(var leadout_index in self.moves[move_index].leadout_animations){
				var num_times = self.moves[move_index].leadout_animations[leadout_index].weight;
				//console.log('num times ============ '+num_times);
				for(var x=0; x<num_times;x++){
					self.moves[move_index].choice_array.push(self.moves[move_index].leadout_animations[leadout_index].name);
				}
			}
		}
		//console.log(self.moves);
	}
	self.alternate_direction = function(){
		if(self.direction == 'left'){
			self.direction = 'right';
		}
		else{
			self.direction = 'left';
		}
	}
	self.choose_next_move = function(){
		//console.log('choosing next move')
		var option_count = self.current_move.choice_array.length;
		console.log('getting count of options',option_count);
		var random_num = self.get_random(0,option_count);
		console.log('random number is ',random_num);
		var random_choice_name = self.current_move.choice_array[random_num];
		console.log('random choice name ',random_choice_name);
		var random_choice = self.moves[random_choice_name];
		console.log('getting random choice',random_choice);
		self.current_move = random_choice;
		console.log('I choose ',self.current_move);
		return self.current_move;
	}
	self.get_random_fraction = function(){
		return Math.random();
	}
	self.get_random = function(min,max){
		var random = Math.floor(Math.random()*(max-min))+min;
		return random;
	}
	self.reverse_actor = function(){
		self.canvas.toggleClass('reverse');
	}
	self.stop_animating = function(){
		self.playing=false;
		self.stop_heartbeat();
	}
	self.start_animating = function(){
		self.playing=true;
		self.start_heartbeat();
	}
	self.start_heartbeat = function(){
		//console.log('start heartbeat called');
		if(self.timer!=null){
			self.stop_heartbeat();
		}
		self.timer = setTimeout(self.process_heartbeat,self.time_per_frame);
	}
	self.stop_heartbeat = function(){
		clearTimeout(self.timer);
		self.timer = null;
	}
	self.process_heartbeat = function(){
		//console.log('process heartbeat called');
		self.goto_next_frame();
	}
	self.goto_next_frame = function(){
		console.log('goto next frame called');
		self.total_frames++;
		if(self.total_frames>self.max_frames){
			return;
		}
		var next_frame = self.current_frame+1;
		console.log('current frame: '+self.current_frame,'this animation: ',self.current_move,' num frames '+self.current_move.number_of_frames);
		if(next_frame >= self.current_move.number_of_frames){
			console.log('going to next animation')
			self.choose_next_move();
			next_frame=0;
			self.current_framepoint = 0;
			self.load_image(self.current_move);
		}
		else{
			self.current_framepoint -= self.current_move.frame_widths[self.current_frame];
		}
		self.current_frame = next_frame;
		console.log("next frame is ",self.current_frame);
		$("#sprite_label").text(self.current_frame);
		self.get_animation_frame();
		//self.get_animation_frame();
		if(self.playing){
			self.start_heartbeat();
		}
	}
	self.load_image = function(move){
		self.canvas.css({
			'background-image' : 'url('+move.file+')',
			'height': move.frame_height + 'px',
			'width': move.frame_widths[self.current_move.current_framepoint] + 'px'
		});
		console.log('height: ',move.frame_height);
	}
	self.toggle_play = function(){
		if(self.timer!=null){
			self.stop_heartbeat();
		} else {
			self.start_heartbeat();
		}
	}

	self.get_animation_frame = function(){
		console.log('setting to '+self.current_move.frame_widths[self.current_frame]+'px');
		self.canvas.css({
			'background-position' : self.current_framepoint + 'px',
			width: self.current_move.frame_widths[self.current_frame]+'px'
		});
	}
	self.get_animation_frame_end = function(){
		return (self.current_framepoint + self.current_move.frame_widths[self.current_frame]);
	}
	self.init();
}
var animator = null;
$(document).ready(function(){
	animator = new animator_template(moves,$('#sprite'));
	animator.start_animating();
	$("#canvas").click(animator.goto_next_frame);
});