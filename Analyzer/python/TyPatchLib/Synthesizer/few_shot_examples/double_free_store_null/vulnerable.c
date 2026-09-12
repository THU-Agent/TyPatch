extern void kfree(void *pointer);

struct double_free_example_state {
	void *entries;
};

void double_free_example_vulnerable(struct double_free_example_state *state)
{
	kfree(state->entries);
	kfree(state->entries);
}
