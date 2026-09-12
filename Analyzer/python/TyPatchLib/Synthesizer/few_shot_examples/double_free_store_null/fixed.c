extern void kfree(void *pointer);

struct double_free_example_state {
	void *entries;
};

void double_free_example_fixed(struct double_free_example_state *state)
{
	kfree(state->entries);
	state->entries = (void *)0;
	kfree(state->entries);
}
